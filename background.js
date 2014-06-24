var curTabs = {};

function checkForHnId(tabId, changeInfo, tab) {
  delete curTabs[tabId];
  chrome.pageAction.hide(tabId);
  toggledUrl = toggleUrlHttps(tab.url);
  if (toggledUrl !== "") {
    checkUrl(tabId, tab.url);
    checkUrl(tabId, toggledUrl);
  }
};
chrome.tabs.onUpdated.addListener(checkForHnId);

function checkUrl(tabId, url) {
  var xhr = new XMLHttpRequest();
  var url_encoded = encodeURIComponent(url);
  xhr.open("GET", "https://hn.algolia.com/api/v1/search?tags=story&query=" + url_encoded, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var response = JSON.parse(xhr.responseText);
        if (response.hits && response.hits.length > 0) {
          curTabs[tabId] = response.hits.map(function(elem){
              return elem.objectID;
          }).join(",");
          chrome.pageAction.show(tabId);
        }
      }
    }
  }
  xhr.send();
}

function toggleUrlHttps(url) {
  if (url.indexOf("http://") == 0) {
    return url.slice(0, 4) + "s" + url.slice(4);
  }
  if (url.indexOf("https://") == 0) {
    return url.slice(0, 4) + url.slice(5);
  }
  return "";
}

function openHnPage(tab) {
  var ids = curTabs[tab.id].split(',');
  for (id in ids) {
    var url = "http://news.ycombinator.com/item?id=" + ids[id];
    chrome.tabs.create({'url': url, 'windowId': tab.windowId, 'index': tab.index+1});
  }
};
chrome.pageAction.onClicked.addListener(openHnPage);
