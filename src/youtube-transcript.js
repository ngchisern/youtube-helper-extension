const RE_YOUTUBE =
  /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/im;

async function fetchSubtitle(youtubeUrl) {
  const videoId = retrieveVideoId(youtubeUrl);
  if (!videoId) {
    console.log("Invalid youtube url");
    return "";
  }

  const innerTubeApiKey = await retrieveInnerTubeApiKey(videoId);
  if (!innerTubeApiKey) {
    console.log("Cannot retrieve innerTubeApiKey");
    return "";
  }

  const transcriptParams = btoa("\n\x0b" + videoId);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.9999099",
        },
      },
      params: transcriptParams,
    }),
  };

  const transcript = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=${innerTubeApiKey}`, fetchOptions)
    .then((response) => response.json())
    .then((data) => {
      if (!data.actions) {
        console.log("Cannot retrieve transcript");
        return "";
      }
      
      // get the first subtitle list
      const subList = data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.body.transcriptBodyRenderer.cueGroups
      
      const formmatedSubList = subList.map((cueGroup) => {
        const startTime = cueGroup.transcriptCueGroupRenderer.formattedStartOffset.simpleText
        const text = cueGroup.transcriptCueGroupRenderer.cues.map((cue) => {
          return cue.transcriptCueRenderer.cue.simpleText
        }).join('\n')

        return `${startTime}\n${text}`
      })
      
      return formmatedSubList.join('\n\n')
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return transcript;
}

function retrieveVideoId(youtubeUrl) {
  const match = youtubeUrl.match(RE_YOUTUBE);
  if (match) {
    return match[1];
  }
  return null;
}

async function retrieveInnerTubeApiKey(videoId) {
  const videoPage = await fetch(`https://www.youtube.com/watch?v=${videoId}`).then((response) => response.text());
  const match = videoPage.match(/"innertubeApiKey":"([^"]*)"/);
  if (match) {
    return match[1];
  }
  return null;
}

export {
  fetchSubtitle
}
