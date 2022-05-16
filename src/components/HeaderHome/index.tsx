import SearchBar from 'components/SearchBar';
import { Container } from './styles';
import FilterChip from 'components/FilterChip';

interface HeaderHomeProps {
  onChangeHandler: (value: string) => any;
}

function HeaderHome({ onChangeHandler }: HeaderHomeProps) {
  return (
    <Container>
      <img src="/logo-home.svg" style={{ paddingBottom: '20px' }} alt="Logo: Warren: Radar do Investidor" />
      <SearchBar onChange={onChangeHandler} />
      <FilterChip />
    </Container>
  );
}

export default HeaderHome;
