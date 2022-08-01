// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// imports
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

//0x3013a0A416a18f03E7B93d7BCDe10155A024CF02
error Raffle__SendMoreToEnterRaffle();
error Raffle__TransferFailedError();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBlance, uint256 numPlayers, uint256 raffleStates);

/** @title A sample Raffle contract
 * @author Salih Poovathingal Hussainar
 * @notice this contract is for designing un tamparable decentralised smartcontract
 * @dev This contract is a sample Raffle contract.
 *
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    // types declaration

    enum RaffleState {
        OPEN,
        CALCULATING
    }
    // state variables
    uint256 private immutable i_enterenceFee;
    address payable[] private s_players;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscribtionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_intervel;

    // lottary variable
    address private s_recentWinner;
    RaffleState private s_raffleState;

    // events

    event RaffleEnter(address indexed player);
    event RequestRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        address vrfCoordinatorV2,
        uint256 enterenceFee,
        bytes32 gasLane,
        uint64 subscribtionId,
        uint32 callbackGasLimit,
        uint256 intervel
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_enterenceFee = enterenceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscribtionId = subscribtionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_intervel = intervel;
    }

    function enterRaffle() public payable {
        if (msg.value < i_enterenceFee) {
            revert Raffle__SendMoreToEnterRaffle();
        }

        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));

        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        override
        returns (
            bool upKeepNeeded,
            bytes memory /*performData*/
        )
    {
        bool isOpen = (s_raffleState == RaffleState.OPEN);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_intervel);
        bool hasPlayer = (s_players.length > 0);
        bool hasBalance = (address(this).balance > 0);
        upKeepNeeded = (isOpen && timePassed && hasPlayer && hasBalance);
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external override {
        (bool upKeepNeeded, ) = checkUpkeep("");
        if (!upKeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscribtionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /*requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 randomWinnerIndex = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[randomWinnerIndex];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailedError();
        }

        emit WinnerPicked(recentWinner);
    }

    function getEntrenceFee() public view returns (uint256) {
        return i_enterenceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }
}
