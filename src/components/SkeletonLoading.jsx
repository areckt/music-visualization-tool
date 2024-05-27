import styled from 'styled-components'

const SkeletonLoading = ({ title }) => {
  return (
    <SkeletonLoadingStyled>
      {title && <h4>{title}</h4>}
      <div className="skeletonContainer"></div>
    </SkeletonLoadingStyled>
  )
}

const SkeletonLoadingStyled = styled.div`
  margin-bottom: 1rem;

  .skeletonContainer {
    height: 200px;
    position: relative;
    background-color: var(--pico-secondary-background);
    opacity: 0.15;
    overflow: clip;
    border-radius: 0.25rem;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.5) 20%,
        rgba(255, 255, 255, 0.75) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 3s infinite;
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`

export default SkeletonLoading
