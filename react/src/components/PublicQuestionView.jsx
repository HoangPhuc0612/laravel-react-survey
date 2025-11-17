let selectedOptions = [];
export default function PublicQuestionView({
  question,
  index,
  answerChanged = () => {},
  viewAnswer = false,
}) {
  let answerFiles = [];

  function onCheckboxChanged(option, $event) {
    if ($event.target.checked) {
      selectedOptions.push(option.text);
    } else {
      selectedOptions = selectedOptions.filter((op) => op != option.text);
    }
    console.log(selectedOptions);
    answerChanged(selectedOptions);
  }
  function allowedTypes(type) {
    for (const file of question.data.fileType) {
      if (file == type) {
        return true;
      }
    }
    return false;
  }
  function byteToMb(byte) {
    return byte / 1024 / 1024;
  }
  const handleFileChange = (e) => {
    const maxFiles = question.data.quantity;
    const maxSize = question.data.size;
    const selectedFiles = Array.from(e.target.files);
    answerFiles = [];

    if (selectedFiles.length > maxFiles) {
      alert(`Chỉ được phép gửi tối đa ${maxFiles} file.`);
      e.target.value = "";
      return;
    }
    for (const file of selectedFiles) {
      const extension = "." + file.name.split(".").pop().toLowerCase();
      if (!allowedTypes(extension)) {
        alert(`File "${file.name}" không hợp lệ.`);
        e.target.value = "";
        return;
      }
      if (file.size > maxSize) {
        alert(`File "${file.name}" vượt quá "${byteToMb(maxSize)} MB".`);
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        answerFiles.push(reader.result);
        answerChanged(answerFiles);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <fieldset className="mb-4">
        <div>
          <legend className="text-base font-medium text-gray-900">
            {index + 1}. {question.question}{" "}
            {question.required && (
              <span className="text-red-600 text-lg">*</span>
            )}
          </legend>
          <p className="text-gray-500 text-sm">{question.description}</p>
        </div>
        <div className="mt-3">
          {question.type === "select" && (
            <div>
              {viewAnswer && (
                <select
                  name=""
                  id=""
                  value={question.answers.answer}
                  disabled
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Please Select</option>
                  {question.data.options &&
                    question.data.options.map((option) => (
                      <option
                        value={option.text}
                        key={option.uuid}
                        selected={question.answers[0].answer === option.text}
                      >
                        {option.text}
                      </option>
                    ))}
                </select>
              )}
              {!viewAnswer && (
                <select
                  name=""
                  id=""
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Please Select</option>
                  {question.data.options &&
                    question.data.options.map((option) => (
                      <option value={option.text} key={option.uuid}>
                        {option.text}
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}
          {question.type === "radio" && (
            <div>
              {viewAnswer && (
                <>
                  {question.data.options &&
                    question.data.options.map((option) => (
                      <div key={option.uuid} className="flex items-center">
                        <input
                          id={option.uuid}
                          name={"question" + question.id}
                          value={question.answers}
                          type="radio"
                          checked={question.answers[0].answer === option.text}
                          disabled
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label
                          htmlFor={option.uuid}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                </>
              )}
              {!viewAnswer && (
                <>
                  {question.data.options &&
                    question.data.options.map((option) => (
                      <div key={option.uuid} className="flex items-center">
                        <input
                          id={option.uuid}
                          name={"question" + question.id}
                          value={option.text}
                          onChange={(ev) => answerChanged(ev.target.value)}
                          type="radio"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label
                          htmlFor={option.uuid}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}
          {question.type === "checkbox" && (
            <div>
              {viewAnswer && (
                <>
                  {question.data.options &&
                    question.data.options.map((option) => (
                      <div key={option.uuid} className="flex items-center">
                        <input
                          id={option.uuid}
                          onChange={(ev) => onCheckboxChanged(option, ev)}
                          value={option.text}
                          type="checkbox"
                          checked={question.answers[0].answer.includes(
                            option.text
                          )}
                          disabled
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={option.uuid}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                </>
              )}
              {!viewAnswer && (
                <>
                  {question.data.options &&
                    question.data.options.map((option) => (
                      <div key={option.uuid} className="flex items-center">
                        <input
                          id={option.uuid}
                          onChange={(ev) => onCheckboxChanged(option, ev)}
                          value={option.text}
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={option.uuid}
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}
          {question.type === "textarea" && (
            <div>
              {viewAnswer && (
                <textarea
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  name=""
                  id=""
                  value={question.answers[0].answer}
                  disabled
                ></textarea>
              )}
              {!viewAnswer && (
                <textarea
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  name=""
                  id=""
                ></textarea>
              )}
            </div>
          )}
          {question.type === "text" && (
            <div>
              {viewAnswer && (
                <input
                  type="text"
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 block w-full py-2 px-2 border border-gray-300 shadow-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  name=""
                  value={question.answers[0].answer}
                  id=""
                />
              )}
              {!viewAnswer && (
                <input
                  type="text"
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 block w-full py-2 px-2 border border-gray-300 shadow-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  name=""
                  id=""
                />
              )}
            </div>
          )}
          {question.type === "datetime" && (
            <div>
              {viewAnswer && (
                <input
                  type="date"
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 block py-2 px-2 border border-gray-300 shadow-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  name=""
                  disabled
                  value={question.answers[0].answer}
                  id=""
                />
              )}
              {!viewAnswer && (
                <input
                  type="date"
                  onChange={(ev) => answerChanged(ev.target.value)}
                  className="mt-1 block py-2 px-2 border border-gray-300 shadow-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  name=""
                  id=""
                />
              )}
            </div>
          )}
          {question.type === "file" && (
            <div>
              {viewAnswer && (
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL}/${
                    question.answers[0].answer
                  }`}
                  target="_blank"
                  className="px-3 py-1 bg-blue-500 text-white rounded inline-block my-1 w-[25 0px]"
                >
                  {question.answers[0].answer[0].replace("files/", "")}
                </a>
              )}
              {!viewAnswer && (
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple={question.data.quantity > 1}
                  className="mt-1 block py-2 px-2 border border-gray-300 shadow-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              )}
            </div>
          )}
        </div>
      </fieldset>
      <hr />
    </>
  );
}
