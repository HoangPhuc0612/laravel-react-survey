import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios";
import PublicQuestionView from "../components/PublicQuestionView";

export default function SurveyPublicView() {
  const [answers, setAnswers] = useState({});
  const [surveyFinished, setSurveyFinished] = useState(false);
  const [error, setError] = useState({});
  const [survey, setSurvey] = useState({
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`survey/get-by-slug/${slug}`)
      .then(({ data }) => {
        setLoading(false);
        setSurvey(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  function answerChanged(question, value) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  }
  function onSubmit(ev) {
    ev.preventDefault();
    let hasError = false;
    survey.questions.forEach((question) => {
      if (!answers[question.id] && question.required) {
        hasError = true;
        setError((prev) => ({
          ...prev,
          [question.id]: question.question,
        }));
      } else {
        setError((prev) => {
          const newErr = { ...prev };
          delete newErr[question.id];
          return newErr;
        });
      }
      if (!answers[question.id] && !question.required) {
        setAnswers((prev) => ({
          ...prev,
          [question.id]: "",
        }));
      }
    });
    if (hasError) {
      return;
    }
    axiosClient
      .post(`/survey/${survey.id}/answer`, {
        answers,
      })
      .then((response) => {
        setSurveyFinished(true);
      });
  }
  return (
    <div>
      {loading && (
        <div className="text-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {!loading && survey.status && (
        <>
          <form
            className="w-[500px] mx-auto bg-white p-5"
            onSubmit={(ev) => onSubmit(ev)}
          >
            <div className="grid grid-cols-6 mb-5 mt-5">
              <div className="mr-4">
                <img src={survey.image_url} alt="" />
              </div>
              <div className="col-span-5">
                <h1 className="text-3xl mb-3">{survey.title}</h1>
                <p className="text-gray-500 text-sm mb-3">
                  Expire Date: {survey.expire_date}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  Description: {survey.description}
                </p>
              </div>
            </div>
            {surveyFinished && (
              <div className="py-8 px-6 bg-emerald-500 text-white w-full mx-auto">
                Thank you for participating in the survey
              </div>
            )}
            {!surveyFinished && (
              <>
                <div>
                  {survey.questions.map((question, ind) => (
                    <>
                      <PublicQuestionView
                        question={question}
                        key={question.id}
                        index={ind}
                        answerChanged={(val) => answerChanged(question, val)}
                      />
                      {error[question.id] && (
                        <span className="text-red-500">
                          This question is required
                        </span>
                      )}
                    </>
                  ))}
                </div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
              </>
            )}
          </form>
        </>
      )}
      {!loading && !survey.status && (
        <div className="text-center text-2xl">
          Survey currently is not available
        </div>
      )}
    </div>
  );
}
