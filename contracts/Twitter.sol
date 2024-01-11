// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/utils/Context.sol";

contract Twitter is Context {
    // 60 * 10 = 10 minutes.
    // BSC generates a block every 3 seconds.
    uint private constant REMOVE_MAX_BLOCK_TIME = (60 * 10) / 3;

    // Holds a data of a user.
    struct AccountData {
        // Is account under this ID registered.
        bool registered;
        // Number of posts user has sent.
        uint32 postCount;
        // Id of the account.
        uint32 accountId;
        // Login or nickname of this account holder.
        string nickname;
        // An URL to the profile image.
        string avatar;
    }

    // Holds a data of a post.
    // There are some gas savings by shorting uints and changing the variables order.
    // 8 (bool) + 32 + 32 + 32 = 104 which can be stored into single 256 slot.
    struct PostData {
        // Was post removed.
        bool removed;
        // If the post was edited.
        bool edited;
        // Account ID of the sender.
        uint32 senderId;
        // ID of the post to reply.
        uint32 replyId;
        // A block number time of the post creation.
        uint32 blockNumber;
        // Post date.
        uint32 timestamp;
        // Amount of likes.
        uint32 likes;
        // Amount of replies.
        uint32 repliesCount;
        // Message text.
        string message;
    }

    // Total registered users.
    uint public userCount;

    // Total amount of posts.
    uint public postCount;

    // Account ID => Account Data.
    mapping(uint => AccountData) public accounts;

    // Wallet Address => Account ID.
    mapping(address => uint) public accountIds;

    // Account ID => Wallet Address.
    mapping(uint => address) public idsAccount;

    // Post ID => Post Data.
    mapping(uint => PostData) public posts;

    // Account ID => Account Posts Array.
    mapping(uint => uint[]) public userPosts;

    // Post ID => Account ID => bool likes
    mapping(uint => mapping(uint => bool)) public postLikes;

    // Post ID => Replies.
    mapping(uint => mapping(uint => uint)) public replies;

    event AccountRegistered(address owner, uint accountId);
    event NewPost(uint postId, uint replyId, uint senderId);
    event PostEdited(uint postId);
    event PostRemoved(uint postId);
    event PostLiked(uint postId, uint senderId, bool state);

    constructor() {
        userCount = 1;
        postCount = 1;
    }

    function register(
        string calldata pNickname,
        string calldata pAvatar
    ) external {
        AccountData storage accountData = accounts[accountIds[_msgSender()]];
        require(!accountData.registered, "Account already exists");
        uint userId = userCount++;
        accountIds[_msgSender()] = userId;
        accountData = accounts[userId];
        accountData.registered = true;
        accountData.accountId = _safeCastUint32(userId);
        accountData.nickname = pNickname;
        accountData.avatar = pAvatar;
        idsAccount[userId] = _msgSender();

        emit AccountRegistered(_msgSender(), userId);
    }

    function like(uint pPostId) external {
        uint userId = accountIds[_msgSender()];
        require(!postLikes[pPostId][userId], "Cannot like a post twice. ");
        postLikes[pPostId][userId] = true;
        posts[pPostId].likes++;

        emit PostLiked(pPostId, userId, true);
    }

    function unlike(uint pPostId) external {
        uint userId = accountIds[_msgSender()];
        require(postLikes[pPostId][userId], "Cannot unlike a post twice. ");
        postLikes[pPostId][userId] = false;
        posts[pPostId].likes--;

        emit PostLiked(pPostId, userId, false);
    }

    function post(string calldata pMessage, uint pReplyId) external {
        uint postId = postCount++;
        uint userId = accountIds[_msgSender()];
        require(userId > 0, "User not registered");
        PostData storage postData = posts[postId];
        postData.message = pMessage;
        postData.senderId = _safeCastUint32(userId);
        postData.replyId = _safeCastUint32(pReplyId);
        postData.blockNumber = _safeCastUint32(_getCurrentBlockNumber());
        postData.timestamp = _safeCastUint32(block.timestamp);
        accounts[userId].postCount++;
        userPosts[userId].push(postId);
        if (pReplyId > 0) {
            replies[pReplyId][posts[pReplyId].repliesCount++] = postId;
        }

        emit NewPost(postId, pReplyId, userId);
    }

    function editPost(uint pPostId, string calldata pMessage) external {
        uint userId = accountIds[_msgSender()];
        PostData storage postData = posts[pPostId];
        require(userId > 0, "User not registered");
        require(
            postData.senderId == userId,
            "You are not a sender of this message"
        );
        require(
            (_getCurrentBlockNumber() - postData.blockNumber) <=
                REMOVE_MAX_BLOCK_TIME,
            "The update post time has been exceeded"
        );
        postData.edited = true;
        postData.message = pMessage;

        emit PostEdited(pPostId);
    }

    function removePost(uint pPostId) external {
        uint userId = accountIds[_msgSender()];
        PostData storage postData = posts[pPostId];
        require(
            postData.senderId == userId,
            "You are not a sender of this message"
        );
        postData.removed = true;
        postData.message = "";

        emit PostRemoved(pPostId);
    }

    function _safeCastUint32(
        uint value
    ) private pure returns (uint32 retvalue) {
        retvalue = uint32(value);
        // If underflow or overflow the values would be different.
        require(retvalue == value);
    }

    function _getCurrentBlockNumber() internal view virtual returns (uint) {
        return block.number;
    }
}
