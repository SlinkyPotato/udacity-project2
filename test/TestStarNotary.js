const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', async (accs) => {
    accounts = accs;
    owner = accounts[0];

    it('can Create a Star', async() => {
        let tokenId = 1;
        let instance = await StarNotary.deployed();
        await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
        assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
    });
    
    it('lets user1 put up their star for sale', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let starId = 2;
        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        assert.equal(await instance.starsForSale.call(starId), starPrice);
    });
    
    it('lets user1 get the funds after the sale', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 3;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
       
        await instance.approve(user2, starId, {from: user1}); // fixes test case
       
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        await instance.buyStar(starId, {from: user2, value: balance});
        let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
        let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
        let value2 = Number(balanceOfUser1AfterTransaction);
        assert.equal(value1, value2);
    });
    
    it('lets user2 buy a star, if it is put up for sale', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 4;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.approve(user2, starId, {from: user1}); // fixes test case
        await instance.buyStar(starId, {from: user2, value: balance});
        assert.equal(await instance.ownerOf(starId), user2);
    });
    
    it('lets user2 buy a star and decreases its balance in ether', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 5;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.approve(user2, starId, {from: user1}); // fixes test case
        await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
        const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
        let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        assert.equal(value, starPrice);
    });
    
    // Implement Task 2 Add supporting unit tests
    
    it('can add the star name and star symbol properly', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let starId = 6;
        let starName = 'New Star';
    
        // 1. create a Star with different tokenId
        await instance.createStar(starName, starId, {from: user1});
        
        //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        let result = await instance.tokenIdToStarInfo.call(starId);
    
        assert.equal(result, starName);
        assert.equal(await instance.name.call(), 'CoolStar');
        assert.equal(await instance.symbol.call(), 'SNT');
    });
    
    it('lets 2 users exchange stars', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
    
        // 1. create 2 Stars with different tokenId
        let star1Id = 7;
        let star2Id = 8;
        let star1Name = "blueStar";
        let star2Name = "yellowStar";
    
        await instance.createStar(star1Name, star1Id, {from: user1});
        await instance.createStar(star2Name, star2Id, {from: user2});
        // 2. Call the exchangeStars functions implemented in the Smart Contract
    
        await instance.approve(user1, star2Id, {from: user2}); // fixes test case
        await instance.exchangeStars(star1Id, star2Id, {from: user1});
        // 3. Verify that the owners changed
        
        assert.equal(await instance.ownerOf.call(star1Id), user2, "blueStar was not properly transferred");
        assert.equal(await instance.ownerOf.call(star2Id), user1, "yelloStar was not properly transferred");
    });
    
    it('lets a user transfer a star', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];

        // 1. create a Star with different tokenId
        let starId = 9;
        let starName = "GreenStar";

        await instance.createStar(starName, starId, {from: user1});
        
        // 2. use the transferStar function implemented in the Smart Contract
        await instance.transferStar(user2, starId, {from: user1});

        // 3. Verify the star owner changed.
        assert.equal(await instance.ownerOf.call(starId), user2);
    });
    
    it('lookUptokenIdToStarInfo test', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];

        // 1. create a Star with different tokenId
        let starId = 10;
        let starName = "EndStar";

        // 1. create a Star with different tokenId
        await instance.createStar(starName, starId, {from: user1});

        // 2. Call your method lookUptokenIdToStarInfo
        let result = await instance.lookUptokenIdToStarInfo(starId);
        
        // 3. Verify if you Star name is the same
        assert.equal(result, starName);
    });
});