import styled from 'styled-components'

const HorizontalSeparator = () => {
  return <HorizontalSeparatorStyled />
}

const HorizontalSeparatorStyled = styled.div`
  width: 100%;
  height: 0.2rem;
  border-radius: 0.1rem;
  margin: 2rem 0;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    var(--pico-muted-border-color) 25%,
    var(--pico-muted-border-color) 75%,
    rgba(255, 255, 255, 0) 100%
  );
`

export default HorizontalSeparator
