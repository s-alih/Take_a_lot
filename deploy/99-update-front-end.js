const { ethers, network } = require("hardhat")
const fs = require("fs")

let FRONT_END_ADDRESS_FILE = "../take_a_lot_front_end/constants/contractAddress.json"
let FRONT_END_ABIS = "../take_a_lot_front_end/constants/abi.json"

require("dotenv").config()
module.exports = async function () {
    if (process.env.UPDATE_CONTRACT_ADDRESSES) {
        updateContractAddresses()
        updateAbi()
    }
}

async function updateAbi() {
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABIS, raffle.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    let chainId = network.config.chainId.toString()
    const raffle = await ethers.getContract("Raffle")
    const currentAddress = JSON.parse(fs.readFileSync(FRONT_END_ADDRESS_FILE, "utf-8"))
    if (chainId in currentAddress) {
        if (!currentAddress[[network.config.chainId.toString()]]) {
            currentAddress[chainId].push(raffle.address)
        }
    } else {
        currentAddress[chainId] = [raffle.address]
    }
    fs.writeFileSync(FRONT_END_ADDRESS_FILE, JSON.stringify(currentAddress))
}

module.exports.tags = ["all", "fontend"]
