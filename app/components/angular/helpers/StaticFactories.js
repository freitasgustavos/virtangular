'use strict';

angular.module('newApp')

    .factory('StaticFactories', function() {

        return {

            BANCOS : [{
                ban_cod_ban    :  1,
                ban_int_codigo :  1,
                ban_flag_ban   :  true,
                ban_descricao  : 'Banco do Brasil',
                ban_img_url    : '../app/images/bancos/001.png'
            }, {
                ban_cod_ban    :  2,
                ban_int_codigo :  1,
                ban_flag_ban   :  true,
                ban_descricao  : 'Banco do Brasil Empresa',
                ban_img_url    : '../app/images/bancos/001.png'
            }, {
                ban_cod_ban    :  3,
                ban_int_codigo :  1,
                ban_flag_ban   :  true,
                ban_descricao  : 'Banco do Brasil Estilo',
                ban_img_url    : '../app/images/bancos/003.gif'
            }, {
                ban_cod_ban    :  4,
                ban_int_codigo :  341,
                ban_flag_ban   :  true,
                ban_descricao  : 'Itaú',
                ban_img_url    : '../app/images/bancos/004.png'
            }, {
                ban_cod_ban    :  5,
                ban_int_codigo :  341,
                ban_flag_ban   :  true,
                ban_descricao  : 'Itaú Personnalitté',
                ban_img_url    : '../app/images/bancos/005.png'
            }, {
                ban_cod_ban    :  6,
                ban_int_codigo :  341,
                ban_flag_ban   :  true,
                ban_descricao  : 'Itaú Empresas',
                ban_img_url    : '../app/images/bancos/004.png'
            }, {
                ban_cod_ban    :  7,
                ban_int_codigo :  237,
                ban_flag_ban   :  true,
                ban_descricao  : 'Bradesco',
                ban_img_url    : '../app/images/bancos/007.png'
            }, {
                ban_cod_ban    :  8,
                ban_int_codigo :  237,
                ban_flag_ban   :  true,
                ban_descricao  : 'Bradesco Empresas e Negócios',
                ban_img_url    : '../app/images/bancos/007.png'
            }, {
                ban_cod_ban    :  9,
                ban_int_codigo :  237,
                ban_flag_ban   :  true,
                ban_descricao  : 'Bradesco Prime',
                ban_img_url    : '../app/images/bancos/007.png'
            }, {
                ban_cod_ban    :  10,
                ban_int_codigo :  104,
                ban_flag_ban   :  true,
                ban_descricao  : 'Caixa Econômica Federal',
                ban_img_url    : '../app/images/bancos/011.png'
            }, {
                ban_cod_ban    :  11,
                ban_int_codigo :  104,
                ban_flag_ban   :  true,
                ban_descricao  : 'Caixa Econômica Federal Empresas',
                ban_img_url    : '../app/images/bancos/011.png'
            }, {
                ban_cod_ban    :  12,
                ban_int_codigo :  33,
                ban_flag_ban   :  true,
                ban_descricao  : 'Santander',
                ban_img_url    : '../app/images/bancos/012.png'
            }, {
                ban_cod_ban    :  13,
                ban_int_codigo :  33,
                ban_flag_ban   :  true,
                ban_descricao  : 'Santander Empresarial',
                ban_img_url    : '../app/images/bancos/012.png'
            }, {
                ban_cod_ban    :  14,
                ban_int_codigo :  33,
                ban_flag_ban   :  true,
                ban_descricao  : 'Santander Van Gogh',
                ban_img_url    : '../app/images/bancos/012.png'
            }, {
                ban_cod_ban    :  101,
                ban_int_codigo :  9999,
                ban_flag_ban   :  false,
                ban_descricao  : 'Cielo',
                ban_img_url    : '../app/images/bancos/015.gif'
            }],

            NATUREZAS : [{
                'id'   : '2',
                'name' : 'Compra'
            }, {
                'id'   : '4',
                'name' : 'Devolução de Compra'
            }, {
                'id'   : '3',
                'name' : 'Devolução de Venda'
            }, {
                'id'   : '11',
                'name' : 'Orçamento'
            }, {
                'id'   : '6',
                'name' : 'Outras Entradas'
            }, {
                'id'   : '5',
                'name' : 'Outras Saídas'
            }, {
                'id'   : '31',
                'name' : 'Prestação de Serviço'
            }, {
                'id'   : '57',
                'name' : 'Transporte'
            }, {
                'id'   : '1',
                'name' : 'Venda'
            }],

            TIPOS_CADASTRO : [{
                'id'   : '1',
                'name' : 'Cliente'
            }, {
                'id'   : '2',
                'name' : 'Fornecedor'
            }, {
                'id'   : '3',
                'name' : 'Transportadora'
            }],

            STATUS_CADASTRO : [{
                'id'   : '0',
                'name' : 'Ativo'
            },{
                'id'   : '1',
                'name' : 'Inativo'
            }],

            CONTRIB_ICMS : [{
                'id'   : '1',
                'name' : 'Sim'
            }, {
                'id'   : '2',
                'name' : 'Não'
            }],

            NATUREZAS_MOVIMENTACAO : [{
                'id'   : '1',
                'name' : 'Venda'
            }, {
                'id'   : '2',
                'name' : 'Compra'
            }, {
                'id'   : '3',
                'name' : 'Devolução de Venda'
            }, {
                'id'   : '4',
                'name' : 'Devolução de Compra'
            }, {
                'id'   : '5',
                'name' : 'Outras Saídas'
            }, {
                'id'   : '6',
                'name' : 'Outras Entradas'
            }, {
                'id'   : '15',
                'name' : 'Saída de Insumos'
            }, {
                'id'   : '16',
                'name' : 'Entrada para Produção'
            }],

            UF : [{
                'id'   : '1',
                'uf'   : 'AC',
                'nome' : 'Acre'
            }, {
                'id'   : '2',
                'uf'   : 'AL',
                'nome' : 'Alagoas'
            }, {
                'id'   : '3',
                'uf'   : 'AM',
                'nome' : 'Amazonas'
            }, {
                'id'   : '4',
                'uf'   : 'AP',
                'nome' : 'Amapá'
            }, {
                'id'   : '5',
                'uf'   : 'BA',
                'nome' : 'Bahia'
            }, {
                'id'   : '6',
                'uf'   : 'CE',
                'nome' : 'Ceará'
            }, {
                'id'   : '7',
                'uf'   : 'DF',
                'nome' : 'Brasília'
            }, {
                'id'   : '8',
                'uf'   : 'ES',
                'nome' : 'Espírito Santo'
            }, {
                'id'   : '9',
                'uf'   : 'GO',
                'nome' : 'Goiás'
            }, {
                'id'   : '10',
                'nome' : 'Maranhão',
                'uf'   : 'MA'
            }, {
                'id'   : '11',
                'uf'   : 'MG',
                'nome' : 'Minas Gerais'
            }, {
                'id'   : '12',
                'uf'   : 'MS',
                'nome' : 'Mato Grosso do Sul'
            }, {
                'id'   : '13',
                'uf'   : 'MT',
                'nome' : 'Mato Grosso'
            }, {
                'id'   : '14',
                'uf'   : 'PA',
                'nome' : 'Pará'
            }, {
                'id'   : '15',
                'uf'   : 'PB',
                'nome' : 'Paraná'
            }, {
                'id'   : '16',
                'uf'   : 'PE',
                'nome' : 'Pernambuco'
            }, {
                'id'   : '17',
                'uf'   : 'PI',
                'nome' : 'Piauí'
            }, {
                'id'   : '18',
                'uf'   : 'PR',
                'nome' : 'Paraná'
            }, {
                'id'   : '19',
                'uf'   : 'RJ',
                'nome' : 'Rio de Janeiro'
            }, {
                'id'   : '20',
                'uf'   : 'RN',
                'nome' : 'Rio Grande do Norte'
            }, {
                'id'   : '21',
                'uf'   : 'RO',
                'nome' : 'Rondônia'
            }, {
                'id'   : '22',
                'uf'   : 'RR',
                'nome' : 'Roraima'
            }, {
                'id'   : '23',
                'uf'   : 'RS',
                'nome' : 'Rio Grande do Sul'
            }, {
                'id'   : '24',
                'uf'   : 'SC',
                'nome' : 'Santa Catarina'
            }, {
                'id'   : '25',
                'uf'   : 'SE',
                'nome' : 'Sergipe'
            }, {
                'id'   : '26',
                'uf'   : 'SP',
                'nome' : 'São Paulo'
            }, {
                'id'   : '27',
                'uf'   : 'TO',
                'nome' : 'Tocantins'
            }],

            ESPECIES_DOCUMENTO : [{
                'id'   : '10',
                'nome' : 'DAV'
            }, {
                'id'   : '11',
                'nome' : 'PED'
            }, {
                'id'   : '55',
                'nome' : 'NFe'
            }, {
                'id'   : '2',
                'nome' : 'NFD'
            }, {
                'id'   : '65',
                'nome' : 'NFC'
            }, {
                'id'   : '30',
                'nome' : 'CUP'
            }, {
                'id'   : '59',
                'nome' : 'SAT'
            }],

            SETORES : [{
                set_cod_setor : 1,
                set_descricao : 'Alimentação'
            }, {
                set_cod_setor : 2,
                set_descricao : 'Aluguel de Automovéis'
            }, {
                set_cod_setor : 3,
                set_descricao : 'Alumínio'
            }, {
                set_cod_setor : 4,
                set_descricao : 'Automotivas'
            }, {
                set_cod_setor : 5,
                set_descricao : 'Bancos'
            }, {
                set_cod_setor : 6,

                set_descricao : 'Brinquedos'
            }, {
                set_cod_setor : 7,
                set_descricao : 'Cimento'
            }, {
                set_cod_setor : 8,
                set_descricao : 'Calçados'
            }, {
                set_cod_setor : 9,
                set_descricao : 'Celulose e Papel'
            }, {
                set_cod_setor : 10,
                set_descricao : 'Comércio Varejista'
            }, {
                set_cod_setor : 11,
                set_descricao : 'Companhias Agrícolas'
            }, {
                set_cod_setor : 12,
                set_descricao : 'Construtoras'
            }, {
                set_cod_setor : 13,
                set_descricao : 'Cosméticos'
            }, {
                set_cod_setor : 14,
                set_descricao : 'Distribuidoras'
            }, {
                set_cod_setor : 15,
                set_descricao : 'Educação'
            }, {
                set_cod_setor : 16,
                set_descricao : 'Embalagem'
            }, {
                set_cod_setor : 17,
                set_descricao : 'Energia'
            }, {
                set_cod_setor : 18,
                set_descricao : 'Entreterimento'
            }, {
                set_cod_setor : 19,
                set_descricao : 'Ferramentas Elétricas'
            }, {
                set_cod_setor : 20,
                set_descricao : 'Farmacêuticas'
            }, {
                set_cod_setor : 21,
                set_descricao : 'Fotografia'
            }, {
                set_cod_setor : 22,
                set_descricao : 'Gráficas'
            }, {
                set_cod_setor : 23,
                set_descricao : 'Imobiliárias'
            }, {
                set_cod_setor : 24,
                set_descricao : 'Industrial Aeroespacial'
            }, {
                set_cod_setor : 25,
                set_descricao : 'Informática'
            }, {
                set_cod_setor : 26,
                set_descricao : 'Mineração'
            }, {
                set_cod_setor : 27,
                set_descricao : 'Moeda'
            }, {
                set_cod_setor : 28,
                set_descricao : 'Música'
            }, {
                set_cod_setor : 29,
                set_descricao : 'Notícias'
            }, {
                set_cod_setor : 30,
                set_descricao : 'Produtoras de Televisão'
            }, {
                set_cod_setor : 31,
                set_descricao : 'Publicidade'
            }, {
                set_cod_setor : 32,
                set_descricao : 'Químicas'
            }, {
                set_cod_setor : 33,
                set_descricao : 'Seguradoras'
            }, {
                set_cod_setor : 34,
                set_descricao : 'Segurança'
            }, {
                set_cod_setor : 35,
                set_descricao : 'Serviços'
            }, {
                set_cod_setor : 36,
                set_descricao : 'Siderúrgicas'
            }, {
                set_cod_setor : 37,
                set_descricao : 'Turismo'
            }, {
                set_cod_setor : 38,
                set_descricao : 'Tabaco'
            }, {
                set_cod_setor : 39,
                set_descricao : 'Tecnologia'
            }, {
                set_cod_setor : 40,
                set_descricao : 'Telecomunicações'
            }, {
                set_cod_setor : 41,
                set_descricao : 'Televisão'
            }, {
                set_cod_setor : 42  ,
                set_descricao : 'Transportes'
            }, {
                set_cod_setor : 43,
                set_descricao : 'Vestuário'
            }],

            CORES: [
                '#76C6B4',
                '#FBEB98',
                '#D1731B',
                '#2882ED',
                '#F3B084',
                '#DB9AE2',
                '#1EDEE9',
                '#ED72BE',
                '#B4CCE2',
                '#13C552',
                '#744519',
                '#294F3E',
                '#E18163',
                '#6269CD',
                '#E12937'
            ],
            
            RELATORIOS : {
                'CFT' : '/erp/relatorio/cadastros/?',
                'PRO' : '/erp/relatorio/produtos/?',
                'INV' : '/erp/relatorio/inventario/?', 
                'MOV' : '/erp/relatorio/estoque/movimentacao/?',
                'LUC' : '/erp/relatorio/admin/lucratividade/?'
            },
            
            CST1 : [{
                'id'   : 0,
                'nome' : 'Nacional'
            }, {
                'id'   : 1,
                'nome' : 'Estrangeiro Importação Direta'
            }, {
                'id'   : 2,
                'nome' : 'Estrangeiro Adquirida Mercado Interno'
            }, {
                'id'   : 3,
                'nome' : 'Nacional com Conteúdo Importado Superior 40%'
            }, {
                'id'   : 4,
                'nome' : 'Nacional com Produção Básica'
            }, {
                'id'   : 5,
                'nome' : 'Nacional com Conteúdo Importado Inferior 40%'
            }, {
                'id'   : 6,
                'nome' : 'Estrangeiro Importação Direta CAMEX'
            }, {
                'id'   : 7,
                'nome' : 'Estrangeiro Adquirida'
            }, {
                'id'   : 8,
                'nome' : 'Benefício Fiscal ST e Outros'
            }],

            CST2 : [{
                'id'   : '00',
                'nome' : 'Tributado Integralmente'
            }, {
                'id'   : '10',
                'nome' : 'Tributado com cobrança ICMS por ST'
            }, {
                'id'   : '20',
                'nome' : 'Com redução Base de Cálculo'
            }, {
                'id'   : '30',
                'nome' : 'Isenta não tributado com cobrança ICMS ST'
            }, {
                'id'   : '40',
                'nome' : 'Isenta'
            }, {
                'id'   : '41',
                'nome' : 'Não tributada'
            }, {
                'id'   : '50',
                'nome' : 'Suspenso'
            }, {
                'id'   : '51',
                'nome' : 'Diferimento'
            }, {
                'id'   : '60',
                'nome' : 'ICMS cobrado anterior por ST'
            }, {
                'id'   : '70',
                'nome' : 'Com redução Base de Cálculo e cobrado ICMS ST'
            }, {
                'id'   : '90',
                'nome' : 'Outros'
            }],

            CSOSN2 : [{
                'id'   : '101',
                'nome' : 'Tributada Simples Nacional com permissão de crédito'
            }, {
                'id'   : '102',
                'nome' : 'Tributada Simples Nacional sem permissão de crédito'
            }, {
                'id'   : '103',
                'nome' : 'Isenção do ICMS no Simples Nacional para faixa de receita bruta'
            }, {
                'id'   : '201',
                'nome' : 'Tributada SN com permissão de crédito com cobrança ICMS ST'
            }, {
                'id'   : '202',
                'nome' : 'Tributada SN sem permissão de crédito com cobrança ICMS ST'
            }, {
                'id'   : '203',
                'nome' : 'Isenção do ICMS SN com cobrança do ICMS ST'
            }, {
                'id'   : '300',
                'nome' : 'Imune'
            }, {
                'id'   : '400',
                'nome' : 'Não tributada pelo Simples Nacional'
            }, {
                'id'   : '500',
                'nome' : 'ICMS cobrado anteriormente por ST (substituído) ou por antecipação'
            }, {
                'id'   : '900',
                'nome' : 'Outros'
            }]
        }

    });


