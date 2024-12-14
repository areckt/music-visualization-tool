import styled from 'styled-components'
import { useGlobalContext } from '../../context'
import * as vis from '../../utils/vis'
import Seeker from './Seeker'
import { spotifyApi } from 'react-spotify-web-playback'

const TimbreStructureEvents = ({ width, events, audioPlayerRef }) => {
  const EVENT_SIZE = 6
  const EVENT_ACTIVE_SIZE = 9
  const HEIGHT = 100

  const { trackObject, seeker, setSeeker } = useGlobalContext()

  const scale = width / trackObject.getAnalysisDuration()

  const handleClickEvent = (event) => {
    // const accessToken = localStorage.getItem('accessToken')
    // spotifyApi.seek(accessToken, Math.floor(event.time * 1000))
    // setSeeker((event.time - 0.2) * 1000)
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setProgress(event.time - 0.5)
    }
  }

  const color = (element, confidence = 1) => {
    return vis.sinebowColorNormalizedRadius(element.colorAngle, 1, confidence)
  }

  const calcCircleVerticalPosition = (element) => {
    const PADDING_TOP = EVENT_ACTIVE_SIZE
    return PADDING_TOP + (HEIGHT - PADDING_TOP * 2) * element.mdsFeature
  }

  return (
    <TimbreStructureEventsStyled $eventSize={EVENT_ACTIVE_SIZE}>
      <div className="events">
        <Seeker width={width} height={HEIGHT} />
        <svg
          className="eventSVG"
          style={{ marginLeft: -EVENT_SIZE }}
          width={width}
          height={HEIGHT}
        >
          <rect
            className="timbreGraphBackground"
            width={width}
            height={HEIGHT}
            opacity="0"
          ></rect>
          {events.map((event) => (
            <circle
              key={event.time + 'eventCircle'}
              className="event"
              cx={EVENT_SIZE + event.time * scale + EVENT_SIZE / 2}
              cy={calcCircleVerticalPosition(event)}
              r={EVENT_SIZE}
              fill={color(event, event.confidence + 0.5)}
              onClick={() => handleClickEvent(event)}
            ></circle>
          ))}
        </svg>
      </div>
    </TimbreStructureEventsStyled>
  )
}
export default TimbreStructureEvents

const TimbreStructureEventsStyled = styled.div`
  .events {
    .eventSVG {
      .event {
        transition: 0.3s;
        cursor: pointer;

        &:hover {
          r: ${(props) => props.$eventSize};
        }
      }
    }
  }
`
