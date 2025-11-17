import {
  EyeIcon,
  LinkIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PageComponent from "../components/PageComponent";
import SurveyQuestions from "../components/SurveyQuestions";
import { useEffect, useState } from "react";
import TButton from "../components/core/TButton";
import axiosClient from "../axios";
// import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
export default function SurveyView() {
  const navigate = useNavigate();
  const { showToast } = useStateContext();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [survey, setSurvey] = useState({
    title: "",
    slug: "",
    status: false,
    description: "",
    image: null,
    image_url: null,
    expire_date: "",
    questions: [],
  });
  const [error, setError] = useState("");
  const onImageChoose = (ev) => {
    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setSurvey({
        ...survey,
        image: file,
        image_url: reader.result,
      });
      ev.target.value = "";
    };
    reader.readAsDataURL(file);
  };
  const onSubmit = (ev) => {
    ev.preventDefault();
    const payload = { ...survey };
    if (payload.image) {
      payload.image = payload.image_url;
    }
    delete payload.image_url;
    let res = null;
    if (id) {
      res = axiosClient.put(`/survey/${id}`, payload);
    } else {
      res = axiosClient.post("/survey", payload);
    }
    res
      .then((res) => {
        console.log(res);
        navigate("/surveys");
        if (id) {
          showToast("Survey was updated");
        } else {
          showToast("Survey was created");
        }
      })
      .catch((err) => {
        if (err && err.response) {
          setError(err.response.data.errors);
        }
      });
  };

  function onQuestionsUpdate(questions) {
    setSurvey({
      ...survey,
      questions,
    });
  }

  // const addQuestion = () => {
  //   survey.questions.push({
  //     id: uuidv4(),
  //     type: "text",
  //     question: "",
  //     description: "",
  //     data: {},
  //   });
  //   setSurvey({ ...survey });
  // };

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/survey/${id}`).then(({ data }) => {
        setSurvey(data.data);
        setLoading(false);
      });
    }
  }, []);
  const onDeleteClick = (id) => {
    if (window.confirm("Are you sure u want to delete this survey?")) {
      axiosClient.delete(`/survey/${id}`).then(() => {
        navigate("/surveys");
        showToast("Survey was deleted");
      });
    }
  };
  return (
    <PageComponent
      title={!id ? "Create new Survey" : "Update Survey"}
      buttons={
        <div className="flex gap-2">
          {id && (
            <>
              <TButton color="green" href={`/survey/public/${survey.slug}`}>
                <LinkIcon className="h-6 w-6 mr-2"></LinkIcon>
                Public Link
              </TButton>
              <TButton to={`/survey/answers/${survey.id}`}>
                <EyeIcon className="w-5 h-5 mr-2" />
                View Answers
              </TButton>
            </>
          )}
          <TButton color="red" onClick={() => onDeleteClick(id)}>
            <TrashIcon className="h-6 w-6 mr-2"></TrashIcon>
            Delete
          </TButton>
        </div>
      }
    >
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
      {!loading && (
        <form action="#" method="POST" onSubmit={onSubmit}>
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
              {/*Image*/}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Photo
                </label>
                <div className="mt-1 flex items-center">
                  {survey.image_url && (
                    <img
                      src={survey.image_url}
                      alt=""
                      className="w-32 h-32 object-cover"
                    />
                  )}
                  {!survey.image_url && (
                    <span className="flex justify-center items-center text-gray-400 h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                      <PhotoIcon className="w-8 h-8" />
                    </span>
                  )}
                  <button
                    type="button"
                    className="relative ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <input
                      type="file"
                      className="absolute left-0 top-0 right-0 bottom-0 opacity-0"
                      onChange={onImageChoose}
                    />
                    Change
                  </button>
                </div>
              </div>
              {/*Image*/}
              {/*Title*/}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Survey Title
                </label>
              </div>
              <input
                type="text"
                name="title"
                id="title"
                value={survey.title}
                onChange={(ev) =>
                  setSurvey({ ...survey, title: ev.target.value })
                }
                placeholder="Survey Title"
                className={`mt-1 block w-full px-3 py-3 rounded-md shadow-sm border focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  error.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {error.title && (
                <small className="text-red-500">{error.title}</small>
              )}

              {/*Title*/}
              {/*Description*/}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={survey.description}
                  onChange={(ev) =>
                    setSurvey({ ...survey, description: ev.target.value })
                  }
                  placeholder="Describe your survey"
                  className="mt-1 block w-full rounded-sm px-3 py-3 border border-gray-300 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>
              {/*Description*/}

              {/*Expire Date*/}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="expire_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expire Date
                </label>
                <input
                  type="date"
                  name="expire_date"
                  id="expire_date"
                  value={survey.expire_date}
                  onChange={(ev) =>
                    setSurvey({ ...survey, expire_date: ev.target.value })
                  }
                  className={`mt-1 block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    error.expire_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {error.expire_date && (
                  <small className="text-red-500">{error.expire_date}</small>
                )}
              </div>
              {/*Expire Date*/}

              {/*Active*/}
              <div className="flex item-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={survey.status}
                    onChange={(ev) =>
                      setSurvey({ ...survey, status: ev.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="comments"
                    className="font-medium text-gray-700"
                  >
                    Active
                  </label>
                  <p className="text-gray-500">
                    Whether to make survey publicly available
                  </p>
                </div>
              </div>
              {/*Active*/}
              {/* <button type="button" onClick={addQuestion}>
                Add question
              </button> */}
              <SurveyQuestions
                questions={survey.questions}
                onQuestionsUpdate={onQuestionsUpdate}
                error={error}
              ></SurveyQuestions>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <TButton>Save</TButton>
            </div>
          </div>
        </form>
      )}
    </PageComponent>
  );
}
