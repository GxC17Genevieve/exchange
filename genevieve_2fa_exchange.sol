pragma solidity ^0.4.18;

contract GenevieveAuth{
    
    modifier isAdmin(){
        require(msg.sender == admin);
        _;
    }
    
    event SetSecret(address);
    event GetSecret(address);
    
    address public admin;
    
    mapping(address => bytes32) private secrets;
    
    function GenevieveAuth(address _admin){
        admin = _admin;
    }
    
    function setSecret(string _secret){
        secrets[msg.sender] = stringToBytes32(_secret);
        SetSecret(msg.sender);
    }
    
    function getSecret(address _owner) isAdmin constant returns(bytes32){
        return secrets[_owner];
        GetSecret(_owner);
    }
    
    function changeAdmin(address _newAdmin) isAdmin(){
        admin = _newAdmin;
    }
    
    function stringToBytes32(string memory source) private returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
    
        assembly {
            result := mload(add(source, 32))
        }
    }    
}