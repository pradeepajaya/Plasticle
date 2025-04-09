import ContentMain from "../../../components/ContentMain/ContentMain"
import ContentTop from "../../../components/ContentTop/ContentTop"
import { iconsImgs } from "../../../utils/images"
import "./Content.css"

const Content = () => {
  return (
    <div className="main-content">
      <div className="logo-container">
      <img src={iconsImgs.logo} alt="plasticle logo" className="logo" />
      </div>
       <ContentTop/>
       <ContentMain/>
    </div>
  )
}

export default Content