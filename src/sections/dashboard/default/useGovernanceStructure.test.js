import { transformDataToTree, hasMeaningfulGovernanceStructure } from './useGovernanceStructure';

describe('governance structure visibility rules', () => {
  test('does not consider a standalone company as a governance structure', () => {
    const treeData = transformDataToTree([
      {
        idCompany: '1',
        name: 'Empresa Solta',
        document: '00.000.000/0001-00',
        active: true,
        companyBottoms: [],
      },
    ]);

    expect(hasMeaningfulGovernanceStructure(treeData)).toBe(false);
  });

  test('considers active parent-child relationships as a governance structure', () => {
    const treeData = transformDataToTree([
      {
        idCompany: '1',
        name: 'Holding',
        document: '00.000.000/0001-00',
        active: true,
        companyBottoms: [{ idCompanyBottom: '2' }],
      },
      {
        idCompany: '2',
        name: 'Subsidiaria',
        document: '11.111.111/0001-11',
        active: true,
        companyBottoms: [],
      },
    ]);

    expect(hasMeaningfulGovernanceStructure(treeData)).toBe(true);
  });

  test('ignores relationships that only point to inactive companies', () => {
    const treeData = transformDataToTree([
      {
        idCompany: '1',
        name: 'Holding',
        document: '00.000.000/0001-00',
        active: true,
        companyBottoms: [{ idCompanyBottom: '2' }],
      },
      {
        idCompany: '2',
        name: 'Inativa',
        document: '11.111.111/0001-11',
        active: false,
        companyBottoms: [],
      },
    ]);

    expect(hasMeaningfulGovernanceStructure(treeData)).toBe(false);
  });
});
