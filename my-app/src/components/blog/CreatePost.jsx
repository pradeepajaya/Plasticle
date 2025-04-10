import { useState, useEffect, useRef } from "react";
import "./CreatePost.css";

const CreatePost = () => {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const fileInputRef = useRef(null);
  const editableRef = useRef(null);

  useEffect(() => {
    const saveDraft = setInterval(() => {
      if (topic) {
        localStorage.setItem(topic, content);
      }
    }, 5000);

    return () => clearInterval(saveDraft);
  }, [content, topic]);

  const insertHTMLAtCursor = (html) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement("div");
    el.innerHTML = html;

    const frag = document.createDocumentFragment();
    let node, lastNode;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }

    range.insertNode(frag);

    if (lastNode) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    setContent(editableRef.current.innerHTML);
  };

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    for (let item of clipboardItems) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          insertHTMLAtCursor(`<img src="${event.target.result}" alt="pasted" />`);
        };
        reader.readAsDataURL(blob);
        e.preventDefault();
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        insertHTMLAtCursor(`<img src="${event.target.result}" alt="uploaded" />`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    if (!content.trim()) {
      alert("Please add some content.");
      return;
    }

    console.log(`${topic} Posted:`, content);
    alert(`${topic} Posted!`);

    // Clear everything
    setContent("");
    setTopic("");
    localStorage.removeItem(topic);

    if (editableRef.current) {
      editableRef.current.innerHTML = "";
    }

    setIsBold(false);
    setIsItalic(false);
  };

  const toggleFormat = (format) => {
    document.execCommand(format);
    setContent(editableRef.current.innerHTML);

    if (format === "bold") setIsBold(!isBold);
    if (format === "italic") setIsItalic(!isItalic);
  };

  return (
    <div className="create-post-container">
      <div className="editor-box">
        <input
          type="text"
          className="topic-input"
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="toolbar">
          <button
            className={isBold ? "active-btn" : ""}
            onClick={() => toggleFormat("bold")}
          >
            <b>B</b>
          </button>
          <button
            className={isItalic ? "active-btn" : ""}
            onClick={() => toggleFormat("italic")}
          >
            <i>I</i>
          </button>
          <button onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? "Edit" : "Preview"}
          </button>
        </div>

        {isPreview ? (
          <div className="preview-box">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <div
            contentEditable
            className="editable-content"
            onPaste={handlePaste}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            suppressContentEditableWarning={true}
            ref={editableRef}
          ></div>
        )}

        <div className="editor-actions">
          <button onClick={() => fileInputRef.current.click()}>Add Image</button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          <button onClick={handlePost}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
