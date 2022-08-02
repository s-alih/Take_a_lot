const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_AMOUNT = ethers.utils.parseEther("2")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    let chainId = network.config.chainId

    let VRFCoordinatorV2MocksAddress, subscriptionId

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mocks = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2MocksAddress = VRFCoordinatorV2Mocks.address
        const transactionResponse = await VRFCoordinatorV2Mocks.createSubscription()
        const transactionReciept = await transactionResponse.wait(1)
        subscriptionId = transactionReciept.events[0].args.subId
        await VRFCoordinatorV2Mocks.fundSubscription(subscriptionId, VRF_SUB_AMOUNT)
    } else {
        VRFCoordinatorV2MocksAddress = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const enternceFee = networkConfig[chainId]["enternceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const intervel = networkConfig[chainId]["intervel"]

    const args = [
        VRFCoordinatorV2MocksAddress,
        enternceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        intervel,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name)) {
        log("Verifying contract............")
        await verify(raffle.address, args)
    }
}

module.exports.tags = ["all", "raffle"]
