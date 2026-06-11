import {
  inferDartScriptArgs,
  isDartPdfTask,
  shouldRunExplicitNpmCommand,
} from './script-runner';

console.assert(
  isDartPdfTask('@하정우 삼성전자 corp_code 00126380 elestock PDF 저장 스크립트 실행'),
  'dart pdf task'
);
console.assert(
  !isDartPdfTask('@한서준 삼성전자 주가 알려줘'),
  'stock query is not dart pdf'
);
console.assert(
  inferDartScriptArgs('corp_code 00126380 최근 3건 PDF').includes('--corp-code 00126380'),
  'corp code'
);
console.assert(inferDartScriptArgs('삼성전자 PDF 5건').includes('--limit 5'), 'limit');
console.assert(
  inferDartScriptArgs('저장 company/projects/dart_test/files/pdfs/DART_임원주요주주').includes(
    'company/projects/dart_test'
  ),
  'out path'
);
console.assert(
  shouldRunExplicitNpmCommand('company/projects/테스트/files/pdf 저장') === null,
  'folder 테스트 must not trigger npm test'
);
console.assert(shouldRunExplicitNpmCommand('npm test 돌려줘') === 'test', 'explicit npm test');
