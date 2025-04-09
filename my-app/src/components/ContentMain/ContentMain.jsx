import Cards from "../Cards/Cards"
import Report from "../Report/Report"
import "./ContentMain.css"

const ContentMain = () => {
  return (
    <div className="main-content-holder">
        <div className="content-grid-one">
            <Cards />
           <Report/>
        </div>
    </div>
  )
}

export default ContentMain