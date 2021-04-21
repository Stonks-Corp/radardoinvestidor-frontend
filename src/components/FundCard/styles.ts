import styled from 'styled-components';

interface InfoProps {
  alignRight?: boolean;
}

interface RowProps {
  marginBottom?: string;
}

export const Container = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 0 8px;
`;

export const Content = styled.div`
  border-top: 1px solid #e3e4eb;
  padding: 12px 0;
`;

export const Row = styled.div<RowProps>`
  margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : 0)};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FundTitle = styled.strong`
  font-family: Montserrat;
  font-size: 20px;
  line-height: 28px;
`;

export const Selected = styled.button`
  background-color: transparent;
  border: 0;
  display: flex;
  align-items: center;

  span {
    font-family: Source Sans Pro;
    font-size: 16px;
    line-height: 24px;
    color: ${(props) => props.theme.colors.textDescription};
  }

  svg.iconSelected {
    color: ${(props) => props.theme.colors.iconSelected};
    margin-left: 12px;
  }

  svg.iconNotSelected {
    color: ${(props) => props.theme.colors.text};
  }
`;

export const Info = styled.div<InfoProps>`
  text-align: ${(props) => (props.alignRight ? 'right' : 'left')};

  p {
    font-family: Source Sans Pro;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    color: ${(props) => props.theme.colors.textDescription};
  }

  span {
    font-family: Source Sans Pro;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 28px;
    color: ${(props) => props.theme.colors.text};
  }
`;
