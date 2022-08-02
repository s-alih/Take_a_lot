const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    let chainId = network.config.chainId

    let VRFCoordinatorV2MocksAddress

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mocks = await ethers.Contract("VRFCoordinatorV2Mocks")
        VRFCoordinatorV2MocksAddress = VRFCoordinatorV2Mocks.address
    } else {
        VRFCoordinatorV2MocksAddress = networkConfig[chainId]["vrfCoordinatorV2"]
    }

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
}
