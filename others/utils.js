
function getThumbnailImageOfVideo(link) {
    // console.log('Link',link);
    const param = link.match(/v=[^&]*/g)[0];
    // console.log('param',param);
    const id = (param && param.length > 2) ? param.substring(2) : '';
    console.log('video id', id);
    const image = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return image;
  }
  
  function getTimeStringOf(time) {
    if(!time){
      return '';
    }
  
    var date = new Date(time);
    // Hours part from the timestamp
    var hours = '0' + date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
  
    var day = "0" + date.getDate();
    var month = "0" + (date.getMonth() + 1);
    var year = date.getFullYear();
  
    // Will display time in 10:30:23 format
    var formattedTime = day.substr(-2) + '/' + month.substr(-2) + '/' + year + ' ' +
     hours.substr(-2) + ':' + minutes.substr(-2);
    return formattedTime;
  }
  
  module.exports = {
      getThumbnailImageOfVideo,
      getTimeStringOf
  }