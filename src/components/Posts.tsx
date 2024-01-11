import { useState, useContext, useEffect, SetStateAction, useCallback } from 'react';
import { TwitterContractContext, TwitterContractContextType } from './TwitterContract';
import { AccountContext, AccountContextType } from './Account';
import Post from './Post';
import { ConnectionContext, ConnectionDataTypes } from './ConnectionManager';
import { Link, useParams } from 'react-router-dom';
import { BaseContractMethod } from 'ethers';
import {BigNumber} from 'bignumber.js';
import FastResponse, { FastResponseData } from './windows/FastResponse';

type Params = {
	id: string;
}

export type PostData = {
    key: number;
    removed: boolean;
    edited: boolean;
    senderId: number;
    replyId: number;
    blockNumber: number;
    timestamp: string;
    likes: number;
    repliesCount: number;
    replies: BaseContractMethod<any[], any, any>;
    message: string; 
}

export type AccountData = {
    postCount: number;
    accountId: number;
    nickname: string;
    avatar: string;
}

// This Posts module is responsible for displaying posts. It can return all posts or topic posts. 
export default function Posts() {
    const twitterContractCtx = useContext<TwitterContractContextType>(TwitterContractContext);
    const accountCtx = useContext<AccountContextType>(AccountContext);
    const connectionCtx = useContext<ConnectionDataTypes>(ConnectionContext);
    
    const [posts, setPosts] = useState<any[]>([]);
    const [newPost, setNewPost] = useState<string>("");
    const [disabled, setDisabled] = useState<boolean>(false);
    const [topicAuthorNickname, setTopicAuthorNickname] = useState<string>('');

    const [fastResponseData, setFastResponseData] = useState<FastResponseData>({
        show: false,
        postId: -1,
        edit: false,
        message: "",
        replyNickname: "",
    });

    const { id } = useParams<Params>();


    const sendPost = useCallback(()=>{
        (async()=>{
            const result = await connectionCtx.sendTransactionWithWindow(twitterContractCtx.contract?.post(newPost, id || "0"));
            if(result)
            {
                setNewPost(""); 
            }
        })();
    }, [connectionCtx, id, newPost, twitterContractCtx.contract]);
    
        
    
    useEffect(()=>{
        (async()=>{
            if(parseInt(id||"0") > 0 && twitterContractCtx.contract) {
                const postData = await twitterContractCtx.contract.posts(id) as PostData;
                const postOwner = await twitterContractCtx.contract.accounts(postData.senderId) as AccountData;
                if(postOwner) {
                    setTopicAuthorNickname(postOwner.nickname);
                }
            }
        })();
        
    }, [id, twitterContractCtx.contract]);

    useEffect(()=>{
        async function loadPostById(postId: number) {
            const postData = await twitterContractCtx.contract?.posts(postId) as PostData;
            if(postData.removed) {
                return;
            }
            const postOwner = await twitterContractCtx.contract?.accounts(postData.senderId) as AccountData;
            let replyNickname = "";
            let replyMessage = "";
            if(new BigNumber(postData.replyId).isGreaterThan("0")) {
                const replyPostData = await twitterContractCtx.contract?.posts(postData.replyId) as PostData;
                const replyOwner = await twitterContractCtx.contract?.accounts(replyPostData.senderId) as AccountData;
                replyNickname = replyOwner.nickname;
                replyMessage = replyPostData.message;
            }
            return <Post key={postId} authorId={postData.senderId} postId={postId} avatar={postOwner.avatar} edited={postData.edited} nickname={postOwner.nickname} date={postData.timestamp} message={postData.message} repliesCount={postData.repliesCount} replyId={postData.replyId} replyNickname={replyNickname} replyMessage={replyMessage} likesCount={postData.likes} setFastResponseData={setFastResponseData} />
        }

        (async()=>{
            if(twitterContractCtx.initialized && twitterContractCtx.contract) {
                let _posts: SetStateAction<any[]> = [];
                // Load all posts.
                if(typeof id === 'undefined') {
                    const _postCount = parseInt(await twitterContractCtx.contract.postCount());
                    for(let i = 1; i < _postCount; i++) {
                        _posts.push(loadPostById(i));
                    }
                    _posts.reverse();
                }
                // Load post replies. 
                else {
                    const postData = await twitterContractCtx.contract.posts(id) as PostData; 
                    if(postData) {
                        _posts.push(loadPostById(parseInt(id)));
                        const repliesCount = parseInt((postData.repliesCount).toString());
                        let replyIds = [];
                        for(let i = 0; i < repliesCount; i++) {
                            replyIds.push(twitterContractCtx.contract.replies(id, i)); 
                        }
                        replyIds = await Promise.all(replyIds);
                        for(let i = 0; i < replyIds.length; i++) {
                            _posts.push(loadPostById(replyIds[i]));
                        }
                    }
                    
                }
                _posts = await Promise.all(_posts);
                setPosts(_posts);
            }
           
        })();
    }, [id, twitterContractCtx.initialized, twitterContractCtx.contract, twitterContractCtx.newPost, twitterContractCtx.postEdited, twitterContractCtx.postRemoved, twitterContractCtx.postLiked]);

    useEffect(()=>{
        if(accountCtx.isRegistered) {
            setDisabled(false);
        }
        else {
            setDisabled(true);
        }
    }, [twitterContractCtx.newAccountRegistered, accountCtx.isRegistered, connectionCtx.walletAddress]);

    const postReplyInput = ()=> {
        return (
            <div className="row mb-2">
                <div className='col-xl-10 col-lg-9 col-md-9'>
                    <textarea className="form-control" placeholder={ parseInt(id||"0") > 0 ? "Post reply to " + topicAuthorNickname  + " here...":"Post something here..." } value={newPost} onInput={
                        (e:React.ChangeEvent<HTMLTextAreaElement>)=>{setNewPost(e.target.value)}
                    } disabled={disabled} />
                </div>
                <div className='col-xl-2 col-lg-3 col-md-3 my-auto'> 
                    <button className='btn btn-primary w-100' onClick={sendPost} disabled={disabled}>Send</button>
                </div>
            </div>
        );
    }

    
    return( 
        <div className='container mt-3'>
            {typeof id !== "undefined" && 
                <div>
                    <Link to={`/`}>
                        <span className="">
                            Back
                        </span>
                    </Link>
                </div>
            }
            { parseInt(id||"0") === 0 && postReplyInput() }
            <div className="row">
                <div className='col'>
                    {posts[0]}
                    { parseInt(id||"0") > 0 && postReplyInput() }
                    {posts.slice(1).map((e)=>{return e;})}
                </div>
            </div>
            {fastResponseData.show && <FastResponse fastResponseData={fastResponseData} setFastResponseData={setFastResponseData}  />}
        </div>
    )
}