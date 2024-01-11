import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Contract, ethers } from "ethers"
import { ConnectionContext, ConnectionDataTypes } from './ConnectionManager';

export type NewAccountRegisteredType = { [key: string]: number }

export type NewPostType = {
    postId: number,
    replyId: number,
    message: string,
    senderId: number
};

export type PostEditedType = {
    postId: number
}

export type PostRemovedType = {
    postId: number
}

export type PostLikedType = {
    postId: number
}

export type TwitterContractContextType = {
    contract: Contract|null,
    initialized: boolean,
    newAccountsRegistered: NewAccountRegisteredType,
    newAccountRegistered: string,
    newPost: NewPostType|null,
    postEdited: PostEditedType|null,
    postRemoved: PostRemovedType|null,
    postLiked: PostLikedType|null
}

export const TwitterContractContext = createContext<TwitterContractContextType>({
    contract: null,
    initialized: false,
    newAccountsRegistered: {},
    newAccountRegistered: '',
    newPost: null,
    postEdited: null,
    postRemoved: null,
    postLiked: null
});

interface NetworkInfo {
    address: string;
}

interface ArtifactInfo {
    abi: any,
    networks : NetworkInfo[]
}

// As name suggests, this is the twitter contract module with can get or set it's variables. 
export default function TwitterContract({children}:any) {

    const connectionCtx = useContext<ConnectionDataTypes>(ConnectionContext);

    // Our contract. 
    const [ twitterContract, setTwitterContract ] = useState<Contract|null>(null);
    // If it is accessible to read and write data. 
    const [ initialized, setInitialized ] = useState<boolean>(false);
    // address => account ID
    const [ newAccountsRegistered, setNewAccountsRegistered ] = useState<NewAccountRegisteredType>({});
    // The last registered address. 
    const [ newAccountRegistered, setNewAccountRegistered ] = useState<string>('');
    // The last added post. 
    const [ newPost, setNewPost ] = useState<NewPostType|null>(null);
    // The last edited post. 
    const [ postEdited, setPostEdited ] = useState<PostEditedType|null>(null);
    // The last deleted post. 
    const [ postRemoved, setPostRemoved ] = useState<PostRemovedType|null>(null);
    // The last liked post. 
    const [ postLiked, setPostLiked ] = useState<PostLikedType|null>(null);

    
    // Event handler, called when new account was registered. 
    const onEventAccountRegistered = useCallback((owner: string, accountId: number)=>{
        // Adding it to the array. 
        setNewAccountsRegistered({
            ...newAccountsRegistered,
            [ethers.getAddress(owner)]:accountId
        });
        // Updating the last registered account. 
        setNewAccountRegistered(ethers.getAddress(owner));

        // Called when new account was registered. 
    }, [newAccountsRegistered]);

    //
    const onEventNewPost = useCallback((postId: number, replyId: number, senderId: number)=>{
        (async()=>{
            //const post = await twitterContract?.posts(postId);
            setNewPost({
                postId: postId,
                replyId: replyId,
                //message: post.message,
                message: '',
                senderId: senderId
            });
        })();
        
    }, []);
    const onEventPostEdited = useCallback((postId: number)=>{
        setPostEdited({
            postId: postId
        });
    }, []);
    const onEventPostRemoved = useCallback((postId: number)=>{
        setPostRemoved({
            postId: postId
        });
    }, []);
    const onEventPostLiked = useCallback((postId: number, senderId: number, state: boolean)=>{
        setPostLiked({
            postId: postId
        });
    }, []);

    useEffect(()=>{
        (async()=>{
            if(connectionCtx.isConnected) {
                const artifact : ArtifactInfo = require(`./../contracts/Twitter.json`);
                const ethersNetVersion = await connectionCtx.provider.send('net_version', []);
                const networkValue = artifact.networks[ethersNetVersion];
                const signer = await connectionCtx.provider.getSigner();
                const _contract = new Contract(networkValue.address, artifact.abi, signer);
                _contract.on("AccountRegistered", onEventAccountRegistered);
                _contract.on("NewPost", onEventNewPost);
                _contract.on("PostEdited", onEventPostEdited);
                _contract.on("PostRemoved", onEventPostRemoved);
                _contract.on("PostLiked", onEventPostLiked);
                setTwitterContract(_contract);
                setInitialized(true);

                return ()=>{
                    twitterContract?.removeAllListeners();
                }
            }
            
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectionCtx.isConnected, connectionCtx.walletAddress]);

    const value: TwitterContractContextType = {
        contract: twitterContract,
        initialized: initialized,
        newAccountsRegistered: newAccountsRegistered,
        newAccountRegistered: newAccountRegistered,
        newPost: newPost,
        postEdited: postEdited,
        postRemoved: postRemoved,
        postLiked: postLiked
    };

    return(
        <TwitterContractContext.Provider value={value}>
            {children}
        </TwitterContractContext.Provider>
    )
}