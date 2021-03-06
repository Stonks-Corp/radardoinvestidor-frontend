import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { MdShare } from 'react-icons/md';

import { FundsContext } from 'contexts/Funds';
import { formatCnpj, formatDate } from 'utils/stringHelper';
import api from 'api';
import theme from 'styles/theme';

import TopBar from 'components/TopBar';
import Screen from 'components/Screen';
import FundCard from 'components/FundCard';
import Modal from 'components/Modal';
import ShareModal from 'components/ShareModal';
import Chart from 'components/Chart';
import Loading from 'components/Loading';
import Button from 'components/Button';
import DataFilter from 'components/DataFilter';

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  padding: 15px 24px;
  overflow-y: auto;
  flex: 1;
`;

export const FilterContent = styled.div`
  padding: 15px 24px;
`;

export const ChartContainer = styled.div<IChartContainer>`
  margin: ${(props) => (props.isLoading ? '15px' : 'auto 15px')};
`;

export const TitleChart = styled.strong<any>`
  font-family: Montserrat;
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  border-bottom: 1px solid #e3e4eb;
  margin: 15px 24px 12px;
`;

export const TitleFundos = styled.strong<any>`
  font-family: Montserrat;
  font-size: 20px;
  line-height: 28px;
  border-bottom: 1px solid #e3e4eb;
  font-weight: bold;
  margin: 15px auto;
  display: flex;
`;

export const FooterChart = styled.div`
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
`;

interface IChartContainer {
  isLoading: boolean;
}
interface IDatasets {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface IParams {
  fundos: any[];
  from?: string;
  to: string;
}

export default function Comparacao() {
  const { selectedFunds, updateSelectedFunds, foundedFunds } = useContext(
    FundsContext
  );
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [detailedFund, setDetailedFund] = useState({});
  const [rentabFunds, setRentabFunds] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<IDatasets[]>([]);
  const [dataFilter, setDataFilter] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0]
  );
  const [isToHiddenCDI, setisToHiddenCDI] = useState(false);
  const [isToHiddenSELIC, setisToHiddenSELIC] = useState(false);

  useEffect(() => {
    if (selectedFunds.length) {
      return;
    }

    const fetchComparisonFunds = async () => {
      try {
        const selectedsCnpj = window.location.search
          .replace('?fundos=', '')
          .replace(/%2F/g, '/')
          .split(',');

        const { data } = await api.get('/fundosComparacao', {
          params: {
            fundos: selectedsCnpj,
            to: new Date().toISOString().split('T')[0],
          },
        });

        updateSelectedFunds(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (!foundedFunds.length) {
      fetchComparisonFunds();
    }
  }, [foundedFunds, selectedFunds, window.location.search]);

  useEffect(() => {
    if (window.location.search === '?fundos=') {
      router.push('/');
    }
  }, [window.location.search]);

  useEffect(() => {
    if (!selectedFunds.length) {
      return;
    }

    const fundsCnpj: string[] = selectedFunds.map((fund) =>
      formatCnpj(fund.cnpj_fundo)
    );

    history.replaceState(
      null,
      '',
      window.location.origin.concat(`/comparacao?fundos=${fundsCnpj.join(',')}`)
    );

    const fetchProfitability = async () => {
      try {
        setIsLoading(true);

        const selectedsCnpj = selectedFunds.map((fund) => fund.cnpj_fundo);

        const params: IParams = {
          fundos: selectedsCnpj,
          from: dataFilter,
          to: new Date().toISOString().split('T')[0],
        };

        !dataFilter && delete params.from;
        const { data } = await api.get('/rentabilidade', {
          params: params,
        });

        setRentabFunds(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfitability();
  }, [dataFilter, selectedFunds]);

  useEffect(() => {
    if (!rentabFunds.length) return;

    const diffs = rentabFunds.map((fund: any) => ({
      name: fund.name,
      rentab: fund.rentab.map((rentab: any) => {
        return { x: formatDate(rentab.date), y: rentab.diff };
      }),
    }));

    const datasets = selectedFunds.map((fund, index) => ({
      label:
        fund.denom_social.length > 20
          ? fund.denom_social.substr(0, 20)
          : fund.denom_social,
      backgroundColor: theme.colors.graph[index],
      borderColor: theme.colors.graph[index],
      spanGaps: true,
      data: fund.hidden
        ? []
        : diffs.find((diff) => diff.name === fund.denom_social)?.rentab,
    }));

    const cdiRentab: any = rentabFunds.find((fund) => fund.name === 'CDI');
    const selicRentab: any = rentabFunds.find((fund) => fund.name === 'SELIC');

    const labels = cdiRentab.rentab.map((cdi: any) => formatDate(cdi.x));

    setLabels(labels);

    const CDI = {
      label: 'CDI',
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
      spanGaps: true,
      data: isToHiddenCDI
        ? []
        : cdiRentab.rentab.map((rentab: any) => {
            return { x: formatDate(rentab.date), y: rentab.diff };
          }),
    };

    const SELIC = {
      label: 'SELIC',
      backgroundColor: theme.colors.iconSelected,
      borderColor: theme.colors.iconSelected,
      spanGaps: true,
      data: isToHiddenSELIC
        ? []
        : selicRentab.rentab.map((rentab: any) => {
            return { x: formatDate(rentab.date), y: rentab.diff };
          }),
    };

    const allDatasets = [...datasets, CDI, SELIC];
    let labelsToShow = cdiRentab.rentab.map((data: any) => formatDate(data.x));
    if (isToHiddenCDI) {
      const cdiIndex = allDatasets.findIndex((item) => item.label == 'CDI');
      allDatasets.splice(cdiIndex, 1);

      const selicFund = rentabFunds[rentabFunds.length - 1];
      labelsToShow = selicFund.rentab.map((data: any) => formatDate(data.x));
    }

    if (isToHiddenSELIC) {
      const selicIndex = allDatasets.findIndex((item) => item.label == 'SELIC');
      allDatasets.splice(selicIndex, 1);

      const firstFund = rentabFunds[0];
      labelsToShow = firstFund.rentab.map((data: any) => formatDate(data.x));
    }

    setDatasets(allDatasets);
    setLabels(labelsToShow);
  }, [rentabFunds, selectedFunds, isToHiddenCDI, isToHiddenSELIC]);

  const handleClickDetailButton = async (cnpj: any) => {
    const formatedCnpj = formatCnpj(cnpj);
    const { data } = await api.get(`/fundo/${formatedCnpj}`);
    setIsDetailModalOpen(true);
    setDetailedFund(data);
  };

  const handleClickShareButton = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleToggleCDI = () => {
    setisToHiddenCDI(!isToHiddenCDI);
  };

  const handleToggleSELIC = () => {
    setisToHiddenSELIC(!isToHiddenSELIC);
  };

  const onChangeFilter = (value: string) => {
    const todaysDate = new Date();
    let data = '';

    if (value === '30D') {
      data = new Date(todaysDate.setDate(todaysDate.getDate() - 30))
        .toISOString()
        .split('T')[0];
    } else if (value === '3M') {
      data = new Date(todaysDate.setDate(todaysDate.getDate() - 90))
        .toISOString()
        .split('T')[0];
    } else if (value === '6M') {
      data = new Date(todaysDate.setDate(todaysDate.getDate() - 180))
        .toISOString()
        .split('T')[0];
    } else if (value === '12M') {
      data = new Date(todaysDate.setDate(todaysDate.getDate() - 365))
        .toISOString()
        .split('T')[0];
    } else {
      data = new Date(todaysDate.setDate(todaysDate.getDate() - 720))
        .toISOString()
        .split('T')[0];
    }
    setDataFilter(data);
  };

  return (
    <>
      <Screen>
        <Container>
          <TopBar
            title="Compara????o"
            rightIcon={<MdShare size={24} />}
            onClickRight={handleClickShareButton}
          />
          <TitleChart>Hist??rico de Rendimentos</TitleChart>
          <ChartContainer isLoading={isLoading}>
            {isLoading ? (
              <div
                style={{ position: 'relative', width: '100wv', height: '40vh' }}
              >
                <Loading />
              </div>
            ) : (
              <Chart labels={labels} datasets={datasets} />
            )}
          </ChartContainer>
          <FilterContent>
            <DataFilter
              onChange={onChangeFilter}
              isToHiddenCDI={!isToHiddenCDI}
              isToHiddenSELIC={!isToHiddenSELIC}
              handleOnCDIClick={handleToggleCDI}
              handleOnSELICClick={handleToggleSELIC}
            />
          </FilterContent>
          <Content>
            <Button onClick={() => router.push('/')}>Adicionar</Button>
            <TitleFundos>Fundos</TitleFundos>
            {selectedFunds.map((fund, index) => (
              <FundCard
                index={index}
                isComparison
                isSelected
                fund={fund}
                key={fund.denom_social + index}
                onClickDetails={() => handleClickDetailButton(fund.cnpj_fundo)}
              />
            ))}
          </Content>
        </Container>
      </Screen>
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        details={detailedFund}
      />
      <ShareModal isOpen={isShareModalOpen} onClose={handleCloseShareModal} />
    </>
  );
}
