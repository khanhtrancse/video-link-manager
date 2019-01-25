const request = require('request-promise');
const fs = require('fs');
const Config = require('../config');

/**
 * Get thumbnail image of a youtube video
 * @param {*} link 
 */
function getThumbnailImageOfVideo(link) {
  // console.log('Link',link);
  const params = link.match(/v=[^&]*/g);
  if (!params) {
    return '';
  }
  const param = params[0];
  // console.log('param',param);
  const id = (param && param.length > 2) ? param.substring(2) : '';
  console.log('video id', id);
  const image = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return image;
}

/**
 * Convert timestamp to dd:MM:yyyy hh:mm
 * @param {*} time 
 */
function getTimeStringOf(time) {
  if (!time) {
    return '';
  }

  const date = new Date(time);
  // Hours part from the timestamp
  const hours = '0' + date.getHours();
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();

  const day = "0" + date.getDate();
  const month = "0" + (date.getMonth() + 1);
  const year = date.getFullYear();

  // Will display time in dd:MM:yyyy hh:mm format
  const formattedTime = day.substr(-2) + '/' + month.substr(-2) + '/' + year + ' ' +
    hours.substr(-2) + ':' + minutes.substr(-2);
  return formattedTime;
}

/**
 * Upload image to remote host
 * @param {*} path 
 */
async function uploadImage(path) {
  const formData = {
    image: fs.createReadStream(path),
  };

  const headers = {
    Authorization: 'Client-ID ' + Config.IMGUR_CLIENT_ID,
  }

  let result = await request.post({ url: 'https://api.imgur.com/3/image', headers: headers, formData: formData });
  result = JSON.parse(result);
  if (result.success) {
    return result.data.link;
  };
  throw new Error('Upload image to host error');
}

module.exports = {
  getThumbnailImageOfVideo,
  getTimeStringOf,
  uploadImage
}