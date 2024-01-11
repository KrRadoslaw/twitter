# Decentralized Twitter-ish website
## A simple skill-testing project
(Tested on Windows 10)

## Capabilities

- Posting
- Editing posts (within ~10 minutes of posting them)
- Replying to others' posts
- Deleting posts
- Account registering (with ID) system
- Liking posts
- Showing all posts or single topics
- User interaction with the website through Ethers and Metamask
- Deploying and using smart contracts
- Using React in TypeScript

## Contents

The project includes, among others:

- [React](https://react.dev/) - Creating graphical interfaces for web pages.
- [TypeScript](https://www.typescriptlang.org/) A programming language as a superset of JS with a focus on typing.
- [Ganache](https://trufflesuite.com/ganache/) - Testing on a local test blockchain network.
- [Bootstrap](https://getbootstrap.com/) - Styling the graphical interface. 
- [Truffle](https://trufflesuite.com/) - Designing, compiling, and deploying smart contracts to the network.
- [Ethers](https://ethers.org/) - Interaction of code with the blockchain.
- [Metamask](https://metamask.io/) - Easy control over wallets, transactions, and interaction between users and websites using the blockchain.
- [Visual Studio Code](https://code.visualstudio.com/) - Development environment.
- [NPM](https://breakdance.github.io/breakdance/) - Package manager.
- [GitHub](https://github.com/) - A service for managing repositories.
- [Git](https://git-scm.com/) - A distributed version control system.
- [FontAwesome](https://fontawesome.com/) - An internet's icon library and toolkit. 

## Installation

Choose a location on your disk where you want to install the project. Open the terminal, type `cmd`, and navigate to that location:

```sh
cd <project_location>
```

### Unpacking the Project

Download the project from the website and then unpack it into the folder.

### Install packages

install the necessary packages:

```sh
npm install
```

## Setting Up the Network and Contracts

### Run Ganache
To make the project work correctly, you need to run a test network and deploy the Twitter contract:

```sh
ganache
```

Note: Ganache generates a different mnemonic with each run. Wallets generated from this mnemonic have 100 ETH by default.

Now, you need to control those wallets.

For security reasons, I won't provide a tutorial on how to transfer the mnemonic from Ganache to Metamask or run Ganache with a Metamask mnemonic because it may result in loss of funds. Instead, we'll choose the safest option: transferring the private key from a randomly generated address in Ganache to Metamask. Look at Ganache and copy the private key of the first randomly generated wallet, then import that account into Metamask and paste the private key. You should see a balance of 100 ETH. You'll need to repeat this process each time you reset Ganache. If you want to avoid repetition, set Metamask and Ganache to use a shared mnemonic, but do this at your own risk, as it may involve potential losses. The first account on the Ganache list is the one that will perform transactions. The first transaction will be deploying the contract to the network, and subsequent ones will be mathematical operations.

### Deploying the contract to Ganache

```sh
truffle migrate --network development
```

## Running the Website Server

Open a new terminal and navigate to the project directory:

```sh
npm start
```

The project should work. Connect your Metamask wallet to the website. You can now test the website. 

## License

MIT