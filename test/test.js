const TwitterMock = artifacts.require("TwitterMock");
const truffleAssert = require('truffle-assertions');
const BN = require("bignumber.js");
BN.set({ EXPONENTIAL_AT: 256 });

contract("test", async (accounts) => {

    before(async () => {
        this.Mark = accounts[0];
        this.Alice = accounts[1];
        this.Hacker = accounts[2];
        this.Anon = accounts[3];
        this.twitter = await TwitterMock.new();
    });

    it("Mark can register", async () => {
        await this.twitter.register(
            "someone",
            "",
            { from: this.Mark }
        );
        const accountId = await this.twitter.accountIds(this.Mark);
        const account = await this.twitter.accounts(accountId);
        assert.equal(
            "true",
            account.registered.toString()
        );
    });

    it("Mark can't register again", async () => {
        await truffleAssert.reverts(
            this.twitter.register(
                "someone",
                "",
                { from: this.Mark }
            )
        );
    });

    it("Alice can register", async () => {
        await this.twitter.register(
            "someone",
            "",
            { from: this.Alice }
        );
        assert.equal(
            "true",
            BN(await this.twitter.accountIds(this.Mark)).plus("1").isEqualTo(await this.twitter.accountIds(this.Alice)).toString()
        );
    });

    it("Anon can't post", async () => {
        await truffleAssert.reverts(
            this.twitter.post(
                "I am anonymous",
                BN("0"),
                { from: this.Anon }
            )
        );
    });

    it("Mark can post", async () => {
        this.MarkMessages = ["Hi, I'm Mark"];
        await this.twitter.post(
            this.MarkMessages[0],
            BN("0"),
            { from: this.Mark }
        );

        // postCount returns ID of the last post. 
        this.postId = BN(await this.twitter.postCount()).minus("1");
    });

    it("Hacker can't edit Mark's post", async () => {
        const postBefore = await this.twitter.posts(this.postId);
        await truffleAssert.reverts(
            this.twitter.editPost(
                this.postId,
                "h4x3d",
                { from: this.Hacker }
            )
        );
        const postAfter = await this.twitter.posts(this.postId);

        assert.equal(
            this.MarkMessages[0].toString(),
            postBefore.message.toString()
        );

        assert.equal(
            this.MarkMessages[0].toString(),
            postAfter.message.toString()
        );
    });

    it("Mark can edit his own post", async () => {
        this.MarkMessages[0] = "My own edit";
        await this.twitter.editPost(
            this.postId,
            this.MarkMessages[0],
            { from: this.Mark }
        );
        const postAfter = await this.twitter.posts(this.postId);
        assert.equal(
            this.MarkMessages[0].toString(),
            postAfter.message.toString()
        );
    });

    it("Mark can't edit his own post after passing 10 minutes", async () => {

        await this.twitter.addBlocks(BN("60").multipliedBy("10").dividedBy("3").dp(0));
        await truffleAssert.reverts(
            this.twitter.editPost(
                this.postId,
                this.MarkMessages[0],
                { from: this.Mark }
            )
        );
    });

    it("Hacker can't remove Mark's post", async () => {
        await truffleAssert.reverts(
            this.twitter.removePost(
                this.postId,
                { from: this.Hacker }
            )
        );
        const postAfter = await this.twitter.posts(this.postId);
        assert.equal(
            this.MarkMessages[0].toString(),
            postAfter.message.toString()
        );
    });

    it("Mark can remove his own post", async () => {
        await this.twitter.removePost(
            this.postId,
            { from: this.Mark }
        );
        const postAfter = await this.twitter.posts(this.postId);
        assert.equal(
            "",
            postAfter.message.toString()
        );
        this.MarkMessages[0] = "";
    });

    it("Mark can post more posts", async () => {
        this.MarkMessages.push("important");
        this.MarkMessages.push("new post");
        for (let i = 1; i < this.MarkMessages.length; i++) {
            await this.twitter.post(
                this.MarkMessages[i],
                BN("0"),
                { from: this.Mark }
            );
        }
        const accountId = await this.twitter.accountIds(this.Mark);
        const postCount = (await this.twitter.accounts(accountId)).postCount;
        for (let i = 1; i < postCount; i++) {
            const MarkPostId = await this.twitter.userPosts(accountId, i);
            const MarkPost = await this.twitter.posts(MarkPostId);
            assert.equal(
                this.MarkMessages[i].toString(),
                MarkPost.message.toString()
            );
        }
    });

    it("Alice can like Mark's post", async () => {
        const MarkAccountId = await this.twitter.accountIds(this.Mark);
        this.MarkPost = await this.twitter.userPosts(MarkAccountId, "2");
        const AliceAccountId = await this.twitter.accountIds(this.Alice);
        await this.twitter.like(
            this.MarkPost,
            { from: this.Alice }
        );
        const wasLiked = await this.twitter.postLikes(this.MarkPost, AliceAccountId);
        assert.equal(
            "true",
            wasLiked.toString()
        );
        const likes = BN((await this.twitter.posts(this.MarkPost)).likes);
        assert.equal(
            "1",
            likes.toString()
        );
        await truffleAssert.reverts(
            this.twitter.like(
                this.MarkPost,
                { from: this.Alice }
            )
        );
    });

    it("Alice can unlike Mark's post", async () => {
        const AliceAccountId = await this.twitter.accountIds(this.Alice);
        await this.twitter.unlike(
            this.MarkPost,
            { from: this.Alice }
        );
        const wasLiked = await this.twitter.postLikes(this.MarkPost, AliceAccountId);
        assert.equal(
            "false",
            wasLiked.toString()
        );
        const likes = BN((await this.twitter.posts(this.MarkPost)).likes);
        assert.equal(
            "0",
            likes.toString()
        );
        await truffleAssert.reverts(
            this.twitter.unlike(
                this.MarkPost,
                { from: this.Alice }
            )
        );
    });
});
