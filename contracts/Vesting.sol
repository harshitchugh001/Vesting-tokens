// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// importing necessary libarries from openzeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vesting is Ownable {
    IERC20 public token;

    //roles for the beneficiaires
    enum Role{User, Partner, Team}
    
    //initialized sturct called schedule for the beneficiary
    struct Schedule {
        uint256 cliff;
        uint256 start;
        uint256 duration;
        uint256 amount;
        uint256 released;
    }

    //mapping to store and check the beneficiaries (and added to track the no. of users)
    mapping (address => Schedule) public beneficiaries;
    mapping (address => bool) public addBeneficiaries;

    event BeneficiaryAdded(address indexed beneficiary, uint256 amount, Role role);
    event TokensReleased(address indexed beneficiary, uint256 amount);

    constructor(IERC20 _token) {
        token = _token;
    }

    // adding new beneficicary
    function addBeneficiary(address _beneficiary, uint256 _cliff, uint256 _duration, Role _role) external onlyOwner {
        // check if they exist or not
        require(!addBeneficiaries[_beneficiary], "beneficiary already added");

        uint256 totalTokens = token.balanceOf(address(this));
        uint256 amount = 0;

        if (_role == Role.User) {
            amount = totalTokens * 50 / 100; // 50% of total tokens allocated to users
        } else if (_role == Role.Partner) {
            amount = totalTokens * 25 / 100; // 25% of total tokens allocated to partners
        } else if (_role == Role.Team) {
            amount = totalTokens * 25 / 100; // 25% of total tokens allocated to teams
        } else {
            revert("Invalid role");
        }

        beneficiaries[_beneficiary] = Schedule({
            cliff: block.timestamp + _cliff, // cliff period start
            start: block.timestamp, // vesting start time
            duration: _duration, // duration
            amount: amount, // amount allocated
            released: 0 // amount/tokens released (set to zero because new members have empty balances)
        });

        addBeneficiaries[_beneficiary] = true; // marking the beneficiary
        emit BeneficiaryAdded(_beneficiary, amount, _role);
    }

    // function to calculate the amount released
    function _vestedAmount(Schedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.cliff) {
            return 0;
        }
        if (block.timestamp >= schedule.cliff + schedule.duration) {
            return schedule.amount - schedule.released;
        }
            return ((schedule.amount * (block.timestamp - schedule.cliff)) / schedule.duration) - schedule.released;
}


    //function to release the amount
    function releaseTokens() external {
        Schedule storage schedule = beneficiaries[msg.sender];
        require(block.timestamp >= schedule.cliff, "cliff period not reached!");
        uint256 vested = _vestedAmount(schedule);
        require(vested > 0, "no vested tokens available");

        schedule.released = schedule.released + vested;
        require(token.transfer(msg.sender, vested), "token transfer failed");

        emit TokensReleased(msg.sender, vested);
    }
}

