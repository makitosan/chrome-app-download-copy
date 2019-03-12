// Copyright (c) 2019 https://github.com/makitosan . All rights reserved.

var selectDirectoryButton = document.querySelector('#select_file');
var copyFileButton = document.querySelector('#copy_file');
var listVolumesButton = document.querySelector('#list_volumes');
var downloadDirButton = document.querySelector('#download_dir');
var toggleSettingsButton = document.querySelector('#settings');

var textDownloadDir = document.querySelector('#txt_download_dir');
var textOutputDir = document.querySelector('#txt_output_dir');

function toggleSettings () {
  const settingsArea = document.querySelector('#settings_area');
  if (settingsArea.style.display === "none") {
    settingsArea.style.display = "block";
  } else {
    settingsArea.style.display = "none";
  }
}

function listVolumes () {
  chrome.fileSystem.getVolumeList(function (volumes) {
    if(volumes) {
      volumes.each(function(volume) {
        console.log(volume.volumeId + ' ' + volume.writable);
      });
    } else {
      console.log(JSON.stringify(chrome.runtime.lastError));
    }
  });
}

function chooseDownloadDir () {
  chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(theEntry) {
    console.log(theEntry);
    if (!theEntry) {
      return;
    }
    try { // TODO remove try once retain is in stable.
      chrome.storage.local.set(
        {'downloadDir': chrome.fileSystem.retainEntry(theEntry)});
      refreshSettings();
    } catch (e) {}
  });
}

function chooseOutputDir () {
  chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(theEntry) {
    console.log(theEntry);
    if (!theEntry) {
      return;
    }
    try { // TODO remove try once retain is in stable.
      chrome.storage.local.set(
        {'outputDir': chrome.fileSystem.retainEntry(theEntry)});
      refreshSettings();
    } catch (e) {}
  });
}

function saveFile() {
  // downloadDir から最新のものを取得し、outputDir にコピーする
  // TODO downloadDir, outputDir のチェック

  chrome.storage.local.get("downloadDir", function(storage) {
    // console.log(storage);
    chrome.fileSystem.restoreEntry(storage.downloadDir, function(dir) {
      // console.log(dir);
      // https://qiita.com/k7a/items/4ad843cdc1f05c801d1d
      if (dir.isDirectory) {
        // 6.
        var dirReader = dir.createReader();
        var entries = [];

        // 7.
        // Call the reader.readEntries() until no more results are returned.
        var readEntries = function() {
          dirReader.readEntries (function(results) {
            // console.log(results);
            if (!results.length) {
              // sort by datetime 降順で
              entries.sort((a, b) => {
                if (a.datetime < b.datetime) return 1;
                if (a.datetime > b.datetime) return -1;
                return 0;
              });
              // console.log(entries);
              chrome.storage.local.get("outputDir", function(storage) {
                console.log(storage);
                chrome.fileSystem.restoreEntry(storage.outputDir, function(dir) {
                  // console.log('copy file');
                  // console.log(dir);
                  entries[0].entry.copyTo(dir);
                });
              });

              // copy file to target

              // console.log(entries.join("\n"));
              // displayEntryData(chosenEntry);
            } else {
              results.forEach(function(item) {
                if (item.isFile && item.fullPath.endsWith('.hex')) {
                  // console.log(item);
                  // entries = entries.concat(item.fullPath);
                  item.getMetadata(function(metadata){
                    // console.log(metadata);
                    entries.push({
                      datetime: metadata.modificationTime,
                      entry: item
                    });
                  }, errorHandler);
                }
              });
              readEntries();
            }
          }, errorHandler);
        };
        readEntries(); // Start reading dirs.
      }
      // entry.moveTo(folder)
    })
  });
}

function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    // displayText('Nothing selected.');
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    } else {
      chosenFileEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}

function refreshSettings() {
  chrome.storage.local.get("downloadDir", function(storage) {
    console.log(storage);
    if(storage) {
      chrome.fileSystem.restoreEntry(storage.downloadDir, function (dir) {
        textDownloadDir.innerHTML = dir.fullPath;
      });
    }
  });
  chrome.storage.local.get("outputDir", function(storage) {
    console.log(storage);
    if(storage) {
      chrome.fileSystem.restoreEntry(storage.outputDir, function (dir) {
        textOutputDir.innerHTML = dir.fullPath;
      });
    }
  });
}

function clearState() {
  img.src = "";
  drawCanvas(); // clear it.
  resetCrop();
}

function errorHandler(e) {
  console.error(e);
}

copyFileButton.addEventListener('click', saveFile);
selectDirectoryButton.addEventListener('click', chooseOutputDir);
listVolumesButton.addEventListener('click', listVolumes);
downloadDirButton.addEventListener('click', chooseDownloadDir);
toggleSettingsButton.addEventListener('click', toggleSettings);

$(window).on('load',function(){
  console.log("loaded");
  refreshSettings();
  document.querySelector('#settings_area').style.display = 'none';
});
