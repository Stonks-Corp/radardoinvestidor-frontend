import styled from 'styled-components';

export const Container = styled.li`
  border-bottom: 2px solid ${(props) => props.theme.colors.text};
  flex: 1;

  button {
    width: 100%;
    font-family: 'Source Sans Pro';
    font-weight: bold;
    font-size: 14px;
    line-height: 18px;
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    letter-spacing: 0.5px;
    justify-content: center;
    padding: 12px 0px;
    color: ${(props) => props.theme.colors.text};
    text-transform: uppercase;
  }
`;
