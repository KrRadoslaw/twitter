import LeftCol from "./LeftCol";
import RightCol from "./RightCol";

// The basic layout of the website. 
export default function MainView({children}: any){
    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-3">
                    <LeftCol />
                </div>
                <div className="col-lg-6 border">
                    {children}
                </div>
                <div className="col-lg-3">
                    <RightCol />
                </div>
            </div>
        </div>
    );
}