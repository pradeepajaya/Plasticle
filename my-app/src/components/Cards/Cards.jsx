import CreatePost from "../blog/CreatePost.jsx";
import "./Cards.css";

const topics = [
  "Add a Blog",
  "Add News",
  "Add Recycle Data",
  "Add Initiatives"
];

const Cards = () => {
  return (
    <div className="grid-one-item grid-common grid-c1">
      
      <div className="content-grid">
        {topics.map((title, index) => (
          <div className="content-block" key={index}>
            <h4 className="content-heading">{title}</h4>
            <CreatePost />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;
