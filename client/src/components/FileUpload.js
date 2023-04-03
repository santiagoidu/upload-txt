import React, { Fragment, useState } from "react";
import Message from "./Message";
import Progress from "./Progress";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState("");
  const [filename, setFilename] = useState("Choose File");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [fileContent, setFileContent] = useState("");

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
          );
          setTimeout(() => setUploadPercentage(0), 10000);
        },
      });

      const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });
      setMessage("File uploaded");

      // Read file content and store it in the state and localStorage
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        setFileContent(content);
        localStorage.setItem("fileContent", content);
        // Render the file data into a table
        const lines = content.split("\n");
        const data = lines.map((line) => {
          const columns = line.split(/\s+/);
          return {
            data: columns[0],
            curso: columns[1],
            cpf: columns[2],
            nome: columns[3],
          };
        });
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        const tr = document.createElement("tr");
        const headers = ["Data", "Curso", "CPF", "Nome"];
        headers.forEach((header) => {
          const th = document.createElement("th");
          th.textContent = header;
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        data.forEach((row) => {
          const tr = document.createElement("tr");
          const columns = ["data", "curso", "cpf", "nome"];
          columns.forEach((column) => {
            const td = document.createElement("td");
            td.textContent = row[column];
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        const container = document.createElement("div");
        container.appendChild(table);
        document.body.appendChild(container);
      };
      reader.readAsText(file);
    } catch (err) {
      if (err.response.status === 500) {
        setMessage("There was a problem with the server");
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };
  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className="custom-file mb-4">
          <input
            type="file"
            className="custom-file-input"
            id="customFile"
            onChange={onChange}
            accept=".doc,.docx,.xml,.txt"
          />
          <label className="custom-file-label" htmlFor="customFile">
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />

        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
      {uploadedFile.fileName ? (
        <div className="row mt-5">
          <div className="col-md-6 m-auto">
            <h3 className="text-center">{uploadedFile.fileName}</h3>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Curso</th>
                  <th>CPF</th>
                  <th>Nome</th>
                </tr>
              </thead>
              <tbody>
                {fileContent.split("\n").map((line, index) => {
                  if (line) {
                    const [data, curso, cpf, nome] = line.split(/[\t]+/);
                    return (
                      <tr key={index}>
                        <td>{data}</td>
                        <td>{curso}</td>
                        <td>{cpf}</td>
                        <td>{nome}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
            <a
              href={uploadedFile.filePath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link para download
            </a>

            <button onClick={() => window.open(uploadedFile.filePath)}>Open File</button>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;