import {
  isOpenDartDisclosureQuery,
  isStockMarketQuery,
  isStockQuoteApi,
  shouldTryExternalApi,
} from './auto-detect';
import type { ExternalApi } from '../types/external-api';

function makeApi(partial: Partial<ExternalApi> & Pick<ExternalApi, 'id' | 'name' | 'baseUrl'>): ExternalApi {
  return {
    description: '',
    authType: 'query-param',
    authHeaderName: 'X-API-Key',
    authQueryParam: 'crtfc_key',
    enabled: true,
    apiKey: 'test-key',
    defaultHeaders: {},
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...partial,
  };
}

const dartApi = makeApi({
  id: 'dart-1',
  name: '다트 (전자공시)',
  baseUrl: 'https://opendart.fss.or.kr/api',
  description: 'Open DART',
  authQueryParam: 'crtfc_key',
});

const finnhubApi = makeApi({
  id: 'finnhub-1',
  name: 'Finnhub',
  baseUrl: 'https://finnhub.io/api/v1',
  description: 'Stock quotes',
  authQueryParam: 'token',
});

// Manual sanity checks (run via ts-node if needed)
if (process.env.STOCK_ROUTING_SELFTEST === '1') {
  console.assert(isStockMarketQuery('삼성전자 주가 알려줘'));
  console.assert(!shouldTryExternalApi('삼성전자 주가 알려줘', [dartApi]));
  console.assert(shouldTryExternalApi('AAPL stock quote', [finnhubApi]));
  console.assert(isStockQuoteApi(finnhubApi));
  console.assert(!isStockQuoteApi(dartApi));
  console.assert(!shouldTryExternalApi('삼성전자 elestock 소유보고 조회', [dartApi]));
  console.assert(isOpenDartDisclosureQuery('다트 elestock PDF 다운'));
  console.log('stock routing selftest ok');
}

export {};
