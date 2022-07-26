import ReactDOM from 'react-dom';
import { Subtitle, SubtitleContainer, SUBTITLE_WRAPPER_ID } from '../../../../definition/watchVideoDefinition';
import { generateSubtitleNodeList, subtitleNodeList } from './subtitle';
import { NetflixVideo } from './video';

const WITHOUT_CONTROLLER_BOTTOM = '6%';
const WITH_CONTROLLER_BOTTOM = '8%';

const scriptId = 'subtitle-assistant-script';
// trigger when click next
if (document.getElementById(scriptId)) {
    location.reload();
}
let s = document.createElement('script');
s.id = 'subtitle-assistant-script';
s.src = chrome.runtime.getURL('watchVideo/netflix/inject.js');
(document.head || document.documentElement).appendChild(s);

window.addEventListener('generateSubtitleNodeList', generateSubtitleNodeList);

const observerConfig = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
};

const documentObserver = new MutationObserver((mutations, observer) => {
    // check subtitle element
    // TODO review redirect
    let subtitleWrapper = document.getElementById(SUBTITLE_WRAPPER_ID);
    if (subtitleWrapper) {
        return;
    }

    // get video player
    let video = document.querySelectorAll('video')[0];
    if (!video) {
        return;
    }

    window.dispatchEvent(new CustomEvent('getVideoPlayer'));

    // add subtitle container
    let netflixVideo = new NetflixVideo(video);
    let originSubtitleElement = document.getElementsByClassName('player-timedtext')[0];
    originSubtitleElement.parentElement!.removeChild(originSubtitleElement);
    document.body.style.userSelect = 'text';
    let mountElement = document.getElementsByClassName('watch-video--player-view')[0] as HTMLElement;

    let subtitle = new Subtitle(subtitleNodeList);

    ReactDOM.render(
        <SubtitleContainer video={netflixVideo} subtitle={subtitle} mountElement={mountElement}></SubtitleContainer>,
        document.body.appendChild(document.createElement('div'))
    );

    const subtitleContainer = mountElement.lastElementChild as HTMLElement;
    const videoPlayerViewObserver = new MutationObserver((mutations, observer) => {
        // dynamic adjust subtitle container bottom
        let videoController = mountElement.getElementsByClassName('watch-video--bottom-controls-container')[0];
        if (videoController) {
            subtitleContainer.style.bottom = WITH_CONTROLLER_BOTTOM;
        } else {
            subtitleContainer.style.bottom = WITHOUT_CONTROLLER_BOTTOM;
        }
    });
    videoPlayerViewObserver.observe(document.getElementsByClassName('watch-video--player-view')[0], observerConfig);
});

documentObserver.observe(document, observerConfig);
