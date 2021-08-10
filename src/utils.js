export const shortenAddress = address => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
}

export const getFixedLength = x => {
  var length = 0;
  if (x === 0){
    length = -3;
  }
  if (x.toString().split(".").length > 1)
  {
    var temp = x.toString().split(".")[1];
    for (let i=0;i<temp.length;i++){
      if (temp[i] === '0'){
        length++;
      }else{
        break;
      }
    }
  }
  return length;
}