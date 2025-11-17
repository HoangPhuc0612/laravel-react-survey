<?php

namespace App\Http\Controllers;

use App\Enums\QuestionTypeEnum;
use App\Http\Requests\StoreSurveyAnswerRequest;
use App\Http\Requests\SurveyStoreRequest;
use App\Http\Requests\SurveyUpdateRequest;
use App\Http\Resources\SurveyResource;
use App\Http\Resources\SurveyAnswerResource;
use App\Http\Resources\SurveyQuestionAnswerResource;
use App\Models\Survey;
use App\Models\SurveyAnswer;
use App\Models\SurveyQuestion;
use App\Models\SurveyQuestionAnswer;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Redis;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Support\Facades\Validator;
use Psy\Sudo;

class SurveyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        return SurveyResource::collection(Survey::where('user_id',$user->id)->orderBy('created_at','DESC')->paginate(3));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SurveyStoreRequest $request)
    {
        $data = $request->validated();
        if (isset($data['image'])) {
            $relativePath = $this->saveImage($data['image']);
            $data['image'] = $relativePath;
        }

        $survey = Survey::create($data);

        // Create new questions
        foreach ($data['questions'] as $question) {
            $question['survey_id'] = $survey->id;
            $this->createQuestion($question);
        }

        return new SurveyResource($survey);
    }

    /**
     * Display the specified resource.
     */
    public function show(Survey $survey,Request $request)
    {
        $user = $request->user();
        if($user->id !== $survey->user_id){
            return abort(403,'Unauthorized action');
        }
        return new SurveyResource($survey);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SurveyUpdateRequest $request, Survey $survey)
    {
        $data = $request->validated();
        if(isset($data['image'])){
            $relativePath = $this->saveImage($data['image']);
            $data['image'] = $relativePath;

            if($survey->image){
                $absolutePath = public_path($survey->image);
                File::delete($absolutePath);
            }
        }
        $survey->update($data);
        $existingIds = $survey->questions()->pluck('id')->toArray();
        $newIds = Arr::pluck($data['questions'],'id');
        $toDelete = array_diff($existingIds,$newIds);
        $toAdd = array_diff($newIds,$existingIds);

        SurveyQuestion::destroy($toDelete);
        foreach($data['questions'] as $question){
            if(in_array($question['id'],$toAdd)){
                $question['survey_id'] = $survey->id;
                $this->createQuestion($question);
            }
        }
        $questionMap = collect($data['questions'])->keyBy('id');
        foreach($survey->questions as $question){
            if(isset($questionMap[$question->id])){                
                $this->updateQuestion($question,$questionMap[$question->id]);
            }
        }
        return new SurveyResource($survey);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Survey $survey,Request $request)
    {
        $user = $request->user();
        if($user->id!=$survey->user_id){
            return abort(403,'Unauthorized action');
        }
        $survey->delete();
        if($survey->image){
            $absolutePath = public_path($survey->image);
            File::delete($absolutePath);
        }
        return response('',204);
    }

    public function getSurveyAnswers(Survey $survey,Request $request){
        $user = $request->user();
        if($user->id!=$survey->user_id){
            return abort(403,'Unauthorized action');
        }                
        $answers = SurveyQuestion::where('survey_id', $survey->id)
        ->with(['answers'])
        ->get()
        ->map(function ($q) {
            $counts = [];
            foreach ($q->answers as $ans) {
                $decoded = json_decode($ans->answer, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        $counts[$item] = ($counts[$item] ?? 0) + 1;
                    }
                } 
                else {
                    $value = $decoded ?? $ans->answer;  
                    $counts[$value] = ($counts[$value] ?? 0) + 1;
                }
            }
            $formatted = collect($counts)->map(function ($count, $answer) {
                return [
                    'answer' => $answer,
                    'count' => $count,
                ];
            })->values();
            return [
                'id' => $q->id,
                'question' => $q->question,
                'type' => $q->type,
                'answers' => $formatted,
            ];
        });
        return $answers;
    }

    public function getSurveyAnswer(SurveyAnswer $surveyAnswer,Request $request){
        $user = $request->user();
        if($user->id!=$surveyAnswer->survey->user_id){
            return abort(403,'Unauthorized action');
        }
        $surveyAnswerId = $surveyAnswer->id;

        $surveyAnswer = SurveyAnswer::where('id', $surveyAnswerId)
            ->with([
                'survey.questions.answers' => function ($q) use ($surveyAnswerId) {
                    $q->where('survey_answer_id', $surveyAnswerId);
                }
            ])
            ->first();
        if ($surveyAnswer) {
            $surveyAnswer->survey->questions->each(function ($question) {
                $question->answers->each(function ($answer) {
                    $decoded = json_decode($answer->answer, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $answer->answer = $decoded;
                    }
                });
                $decoded = json_decode($question->data, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $question->data = $decoded;
                }
            });
        }
        return ["surveyAnswer" => $surveyAnswer];
    }

    private function saveImage($image){
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]);
            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('invalid image type');
            }
            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('base64_decode failed');
            }
        } else {
            throw new \Exception('did not match data URI with image data');
        }

        $dir = 'images/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }
        file_put_contents($relativePath, $image);

        return $relativePath;
    }

    private function saveFile($base64String)
    {
        if (preg_match('/^data:([\w\/\-\.+]+);base64,/', $base64String, $matches)) {
            $mimeType = $matches[1];
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
            $base64String = str_replace(' ', '+', $base64String);

            $decodedFile = base64_decode($base64String);

            if ($decodedFile === false) {
                throw new \Exception('Không thể giải mã base64');
            }
            $mimeMap = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'application/pdf' => 'pdf',
                'application/msword' => 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
                'application/vnd.ms-excel' => 'xls',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
                'text/plain' => 'txt',
                'text/csv' => 'csv',
                'application/zip' => 'zip',
                'application/x-rar-compressed' => 'rar',
                'application/json' => 'json',
            ];
            $extension = $mimeMap[$mimeType] ?? explode('/', $mimeType)[1] ?? 'bin';
            $dir = 'files/';
            $fileName = Str::random(20) . '.' . $extension;
            $absolutePath = public_path($dir);
            $relativePath = $dir . $fileName;
            if (!File::exists($absolutePath)) {
                File::makeDirectory($absolutePath, 0755, true);
            }
            file_put_contents($absolutePath . '/' . $fileName, $decodedFile);

            return $relativePath;
        } else {
            throw new \Exception('Dữ liệu không đúng định dạng base64');
        }
    }

    private function createQuestion($data)
    {
        if (is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }
        $validator = Validator::make($data, [
            'question' => 'required|string',
            'required' => 'required|boolean',
            'type' => [
                'required', new Enum(QuestionTypeEnum::class)
            ],
            'description' => 'nullable|string',
            'data' => 'present',
            'survey_id' => 'exists:App\Models\Survey,id'
            
        ]);

        return SurveyQuestion::create($validator->validated());
    }
    private function updateQuestion(SurveyQuestion $question, $data)
    {
        if (is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }
        $validator = Validator::make($data, [
            'id' => 'exists:App\Models\SurveyQuestion,id',
            'question' => 'required|string',
            'required' => 'required|boolean',
            'type' => ['required', new Enum(QuestionTypeEnum::class)],
            'description' => 'nullable|string',
            'data' => 'present',
        ]);

        return $question->update($validator->validated());
    }

    public function getBySlug(Survey $survey){
        if(!$survey->status){
            return response("",404);
        }
        $currentDate=new \DateTime();
        $expireDate = new \DateTime($survey->expire_date);
        if($expireDate<$currentDate){
            return response("",404);
        }
        return new SurveyResource($survey);
    }
    public function storeAnswer(StoreSurveyAnswerRequest $request,Survey $survey){
        $validated = $request->validated();
        $surveyAnswer = SurveyAnswer::create([
            'survey_id' =>$survey->id,
            'start_date'=>date('Y-m-d H:i:s'),
            'end_date'=>date('Y-m-d H:i:s'),
        ]);
        foreach($validated['answers'] as $questionId=>$answer){
            $question = SurveyQuestion::where(['id'=>$questionId,'survey_id'=>$survey->id])->first();
            if(!$question){
                return response("Invalid question ID: \"$questionId\"",400);
            }            
            if($question->type=="file"){
                $files = [];
                foreach ($answer as $ans){
                    $relativePath = $this->saveFile($ans);
                    array_push($files, $relativePath);
                }                
                $data = [
                    'survey_question_id' => $questionId,
                    'survey_answer_id'=>$surveyAnswer->id,
                    'answer' =>is_array($files) ? json_encode($files) : $files,
                ];
            }
            else{
                $data = [
                    'survey_question_id' => $questionId,
                    'survey_answer_id'=>$surveyAnswer->id,
                    'answer' =>is_array($answer) ? json_encode($answer) : $answer,
                ];
            }
            $questionAnswer = SurveyQuestionAnswer::create($data);            
        }
        return response("",201);
    }
}
