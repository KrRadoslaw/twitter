import BigNumber from "bignumber.js"
import { Link } from "react-router-dom"

import { faReply, faEdit, faHeart, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import { ConnectionContext } from "./ConnectionManager";
import { TwitterContractContext, TwitterContractContextType } from "./TwitterContract";
import { AccountContext, AccountContextType } from "./Account";
import { FastResponseData } from "./windows/FastResponse";


export type PostProps = {
    authorId: number,
    postId: number,
    avatar: string,
    edited: boolean,
    nickname: string,
    date: string,
    message: string,
    repliesCount: number,
    replyId: number,
    replyNickname: string,
    replyMessage: string,
    likesCount:number,
    setFastResponseData: Dispatch<SetStateAction<FastResponseData>>,
}

// Displays and returns a single post data. 
export default function Post(props: PostProps) {
    const twitterContractContext = useContext<TwitterContractContextType>(TwitterContractContext);
    const accountCtx = useContext<AccountContextType>(AccountContext);
    const connectionCtx = useContext(ConnectionContext);

    const sendLike = useCallback(()=>{
        (async()=>{
            const isLiked = await twitterContractContext.contract?.postLikes(
            new BigNumber(props.postId.toString()).toString(), 
            new BigNumber(accountCtx.accountId.toString()).toString()
        );
        console.log("is liked?", isLiked);
        connectionCtx.sendTransactionWithWindow(
            isLiked ? 
                twitterContractContext.contract?.unlike(props.postId) : 
                twitterContractContext.contract?.like(props.postId)
        );          
        })();  
    }, [accountCtx.accountId, connectionCtx, props.postId, twitterContractContext.contract]);

    const onClickReplyButton = useCallback(()=>{
        props.setFastResponseData({
            show: true,
            postId: props.postId,
            edit: false,
            message: "",
            replyNickname: props.replyNickname,
        });
    }, [props]);

    const onClickHeartButton = useCallback(()=>{
        sendLike();
    }, [sendLike]);

    const onClickEditButton = useCallback(()=>{
        props.setFastResponseData({
            show: true,
            postId: props.postId,
            edit: true,
            message: props.message,
            replyNickname: props.replyNickname,
        });
    }, [props]);

    const onClickRemoveButton = useCallback(()=>{
        (async()=>{
        connectionCtx.sendTransactionWithWindow(twitterContractContext.contract?.removePost(props.postId));          
        })();  
    }, [connectionCtx, props.postId, twitterContractContext.contract]);

    return (
        <div className="p-1 border-top my-3">
            <div className="d-flex py-1">
                <div>
                    <img src={props.avatar} className="img-fluid" alt="" style={{maxWidth: "50px"}} />
                </div>
                <div className="ms-3 d-flex flex-column w-100">
                    <div>
                        <span className="fw-bold">
                            {props.nickname}
                        </span>
                        <Link to={`/post/${props.postId}`}>
                        <span className="ms-1 text-muted" style={{"fontSize": "0.75rem"}}>
                            {new Date(parseInt(props.date)*1000).toDateString()}
                        </span>
                        </Link>
                        <span className="ms-2 text-muted" style={{"fontSize": "0.75rem"}}>{props.edited && ("(edited)")}</span>
                    </div>
                        
                    {props.replyMessage !== "" && 
                        <div className="m-3 p-1 border">
                            
                            <Link to={`/post/${props.replyId}`}>
                                <span className="" style={{
                                    "fontSize": "0.75rem", 
                                    }}>
                                    Quote: {props.replyNickname}
                                </span>
                            </Link>
                            <div className="m-1" style={{
                                    "fontSize": "0.9rem", 
                                    }}>
                                {props.replyMessage}
                            </div>
                        </div>}
                    <div className="px-1 py-1">
                        {props.message}
                    </div>
                    <div className="row">
                        <div className="col">
                            <button className="btn btn-transparent"><FontAwesomeIcon icon={faHeart} onClick={()=>{onClickHeartButton()}} /><span className="ms-2">{new BigNumber(props.likesCount).isGreaterThan("0") && new BigNumber(props.likesCount).toString()}</span></button>
                        </div>
                        <div className="col">
                            <button className="btn btn-transparent"><FontAwesomeIcon icon={faReply} onClick={()=>{onClickReplyButton()}} /></button>
                            {new BigNumber(props.repliesCount).isGreaterThan("0") && <><FontAwesomeIcon className="ms-1" icon={faComment} /><span className="ms-2">{props.repliesCount.toString()}</span></>} 
                        </div>
                        
                        <div className="col">
                            {accountCtx.accountId === props.authorId && <button className="btn btn-transparent"><FontAwesomeIcon icon={faEdit} onClick={()=>{onClickEditButton()}} /></button>}
                        </div>
                            
                        <div className="col">
                            {accountCtx.accountId === props.authorId && <button className="btn btn-transparent"><FontAwesomeIcon icon={faTrashCan} onClick={()=>{onClickRemoveButton()}} /></button>}
                        </div>
                    </div>
                </div>
            </div>
                
        </div>
    )
}