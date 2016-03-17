import SegmentView from './segment-view';
import TrackView from './track-view';

class MediaMap {

  constructor (hls) {
    this.hls = hls;
  }

  /**
    * @param segmentView {SegmentView}
    * @returns number (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
    */
  getSegmentTime(segmentView){
    var level =  this.hls.levels[segmentView.trackView.level];

    if (!level || !level.details) {
      throw new Error("Called getSegmentTime on a level that was not parsed yet (or whose index didn't exist)");
    }

    let fragments = level.details.fragments;
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        if (fragment.sn == segmentView.sn) {
            return fragment.start;
        }
    }

    throw new Error("Segment index not found");
  }

  /**
    * @param trackView {TrackView}
    * @param beginTime {number}
    * @param duration {number}
    * @returns [SegmentView]
    */
  getSegmentList(trackView, beginTime, duration){
    var level =  this.hls.levels[trackView.level];

    if (!level) {
      throw new Error("getSegmentList: level doesn't exist");
    }

    if (!level.details) {
      console.warn("getSegmentList: level not parsed yet");
      return [];
    }

    let segmentList = [];

    let fragments = level.details.fragments;
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        if (beginTime <= fragment.start && fragment.start <= beginTime + duration) {
            segmentList.push(new SegmentView({
              sn: fragment.sn,
              trackView
            }));
        }
    }

    return segmentList;
  }


  //USED ONLY BY OUR DISPLAYMANAGER

  /**
    * @param segmentView {SegmentView}
    * @returns {SegmentView}
    */
  getNextSegmentView(segmentView){
    var level =  this.hls.levels[segmentView.trackView.level];

    if (segmentView.sn + 1 < level.details.fragments.length) {
      var fragment = level.details.fragments[segmentView.sn + 1],
          trackView = new TrackView({level: fragment.level});
      return new SegmentView({sn: fragment.sn, trackView});
    }

    return null;
  }

  /**
    * @returns trackView {TrackView}
    */
  getTracksList(){

    if (!this.hls.levels) {
      return [];
    }

    let trackList = [];
    for (var i=0; i<this.hls.levels.length; i++) {
      trackList.push(new TrackView({level: i}));
    }

    return trackList;
  }
}

export default MediaMap;