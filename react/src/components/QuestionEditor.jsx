import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStateContext } from "../contexts/ContextProvider";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
export default function QuestionEditor({
  index = 0,
  question,
  addQuestion,
  deleteQuestion,
  questionChange,
}) {
  const [model, setModel] = useState({ ...question });
  const { questionTypes } = useStateContext();
  const [showFileTypes, setShowFileTypes] = useState(false);

  const fileTypes = [
    { id: "Tài liệu", type: [".docx", ".doc", ".txt", ".rtf", ".odt"] },
    { id: "Bảng tính", type: [".xls", ".xlsx", ".ods", ".csv"] },
    { id: "PDF", type: [".pdf"] },
    { id: "Video", type: [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"] },
    { id: "Bản trình bày", type: [".ppt", ".pptx", ".opd"] },
    { id: "Bản vẽ", type: [".dwg", ".dxf", ".svg", ".eps", ".ai", ".pdf"] },
    {
      id: "Hình ảnh",
      type: [".jpg", ".jpeg", ".png", ".gif", ".bpm", ".webp", ".svg"],
    },
    { id: "Âm thanh", type: [".mp3", ".wav", ".ogg", ".m4a", ".flac"] },
  ];
  useEffect(() => {
    questionChange(model);
  }, [model]);
  function upperCaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function shouldHaveOptions(type = null) {
    type = type || model.type;
    return ["select", "radio", "checkbox"].includes(type);
  }
  function typeFile(type = null) {
    type = type || model.type;
    if (type == "file") {
      return true;
    }
    return false;
  }

  function onTypeChange(ev) {
    const newModel = {
      ...model,
      type: ev.target.value,
    };
    if (!shouldHaveOptions(model.type) && shouldHaveOptions(ev.target.value)) {
      if (!model.data.options) {
        newModel.data = {
          options: [{ uuid: uuidv4(), text: "" }],
        };
      }
    }
    if (typeFile(newModel.type)) {
      newModel.data = {
        fileType: [],
        quantity: "1",
        size: "1 MB",
      };
    }
    setModel(newModel);
  }

  function addFileType(e, type) {
    if (e.target.checked) {
      if (!model.data.fileType.includes(type)) {
        model.data.fileType = [...new Set([...model.data.fileType, ...type])];
      }
    } else {
      model.data.fileType = model.data.fileType.filter(
        (item) => !type.includes(item)
      );
    }
    setModel({ ...model });
  }

  function addOption() {
    model.data.options.push({
      uuid: uuidv4(),
      text: "",
    });
    setModel({ ...model });
  }
  function deleteOption(op) {
    model.data.options = model.data.options.filter(
      (option) => option.uuid != op.uuid
    );
    setModel({ ...model });
  }

  return (
    <>
      <div>
        <div className="flex justify-between mb-3">
          {JSON.stringify(model)}
          <h4>
            {index + 1}.{model.question}
          </h4>
          <div className="flex items-center">
            <button
              type="button"
              className="flex items-center text-xs py-1 px-3 mr-2 rounded-sm text-white bg-gray-600 hover:bg-gray-700"
              onClick={() => addQuestion(index + 1)}
            >
              <PlusIcon className="w-4" />
              add
            </button>
            <button
              type="button"
              className="flex items-center text-xs py-1 px-3 mr-2 rounded-sm text-red-500 border border-transparent hover:border-red-600 font-semibold"
              onClick={() => deleteQuestion(question)}
            >
              <TrashIcon className="w-4" />
              Delete
            </button>
          </div>
        </div>
        <div className="flex gap-3 justify-between mb-3">
          {/* Question Text */}
          <div className="flex-1">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700"
            >
              Question
            </label>
            <input
              required
              type="text"
              name="question"
              id="question"
              value={model.question}
              onChange={(ev) =>
                setModel({ ...model, question: ev.target.value })
              }
              className="mt-1 block w-full px-3 py-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {/* Question Text */}

          {/* Question Type */}
          <div>
            <label
              htmlFor="questionType"
              className="block text-sm font-medium text-gray-700 w-40"
            >
              Question Type
            </label>
            <select
              name="questionType"
              id="questionType"
              onChange={onTypeChange}
              value={model.type}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white py-3 px-3 focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {questionTypes.map((type) => (
                <option value={type} key={type}>
                  {upperCaseFirst(type)}
                </option>
              ))}
            </select>
          </div>
          {/* Question Type */}
          {/* Required */}
          <div>
            <label
              htmlFor="required"
              className="block text-sm font-medium text-gray-700 w-40"
            >
              Required
            </label>
            <input
              type="checkbox"
              id="required"
              name="required"
              checked={model.required}
              onChange={(ev) =>
                setModel({ ...model, required: ev.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          {/* Required */}
        </div>
        {/* Description */}
        <div className="flex-1 mb-3">
          <label
            htmlFor="questionDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="questionDescription"
            id="questionDescription"
            value={model.description || ""}
            onChange={(ev) => {
              setModel({ ...model, description: ev.target.value });
            }}
            className="mt-1 block px-3 py-3 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>
        {/* Description */}

        <div>
          {shouldHaveOptions() && (
            <div>
              <h4 className="text-sm font-semibold mb-1 flex justify-between items-center">
                Options
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center text-xs py-1 px-2 rounded-sm text-white bg-gray-600 hover:bg-gray-700"
                >
                  Add
                </button>
              </h4>
              {model.data.options.length === 0 && (
                <div className="text-xs text-gray-600 text-center py-3">
                  You don't have any options defined
                </div>
              )}
              {model.data.options.length > 0 && (
                <div>
                  {model.data.options.map((op, ind) => (
                    <div className="flex items-center mb-1">
                      <span className="w-6 text-sm">{ind + 1}.</span>
                      <input
                        className="w-full rounded-sm py-1 px-2 text-xs border border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="text"
                        required
                        value={op.text}
                        onChange={(ev) => {
                          op.text = ev.target.value;
                          setModel({ ...model });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteOption(op)}
                        className="h-6 w-6 rounded-full flex items-center justify-center border border-transparent transition-colors hover:border-red-100"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {typeFile() && (
            <div className="flex flex-col space-y-4">
              {/* Tùy chọn 1 */}
              <label className="flex items-center justify-between cursor-pointer">
                <h4 className="mr-5">Chỉ cho phép các loại tệp cụ thể</h4>
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showFileTypes}
                    onChange={() => setShowFileTypes(!showFileTypes)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                </div>
              </label>
              {showFileTypes && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-6">
                  {fileTypes.map((type, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={type.type.every((t) =>
                          model.data.fileType.includes(t)
                        )}
                        onChange={(e) => addFileType(e, type.type)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700 text-sm">{type.id}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Tùy chọn 2 */}
              <label className="flex items-center justify-between cursor-pointer">
                <h4>Số lượng tệp tối đa</h4>
                <select
                  className="border border-gray-300 rounded-md p-1"
                  onChange={(ev) => (
                    (model.data.quantity = ev.target.value),
                    setModel({ ...model })
                  )}
                  value={model.data.quantity}
                >
                  <option value="1">1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>
              </label>

              {/* Tùy chọn 3 */}
              <label className="flex items-center justify-between cursor-pointer">
                <h4>Kích thước tệp tối đa</h4>
                <select
                  className="border border-gray-300 rounded-md p-1"
                  onChange={(ev) => (
                    (model.data.size = ev.target.value), setModel({ ...model })
                  )}
                  value={model.data.size}
                >
                  <option value="1048576">1 MB</option>
                  <option value="10485760">10 MB</option>
                  <option value="104857600">100 MB</option>
                  <option value="1073741824">1 GB</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
