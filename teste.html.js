function salvar_layout_de_impressao() {
    if (!bloqueiaCliqueElemento("#salvar-configuracoes"))return;
    var obj = {
        tambol: (jQuery("#tambol").is(":checked")) ? 'A4' : 'A5',
        orientacaobol: (jQuery("#orientacaobol").is(":checked")) ? '1' : '2',
        seqcarne: (jQuery("#seqcarne").is(":checked")) ? 'i' : 's',
        taxaBoleto: jQuery("#taxaBoleto").val().replace(",", "."),
        showName: (jQuery("#nomeImpresso").is(":checked")) ? 's' : 'n',
        showAddress: (jQuery("#enderecoImpresso").is(":checked")) ? 's' : 'n',
        showPhone: (jQuery("#telefoneImpresso").is(":checked")) ? 's' : 'n',
        linha1: jQuery("#linha1").val(),
        linha2: jQuery("#linha2").val(),
        linha3: jQuery("#linha3").val(),
        linha4: jQuery("#linha4").val(),
        onoffreminder: jQuery("#onoffreminder").is(":checked") ? 's' : 'n',
        interestFee: jQuery("#interestFee").val().replace(",", "."),
        interest_fee_status: jQuery("#interest-fee-status").val(),
        fine: jQuery("#fine").val().replace(",", "."),
        fine_status: jQuery("#fine-status").val(),
        format_fine: jQuery("#formato-multa option:selected").val(),
        myonoffswitch: jQuery("#myonoffswitch").val(),
        onoffnotificacao: jQuery("#onoffnotificacao").is(":checked") ? 's' : 'n',
        ehConvenioComRegistro: jQuery("#convenioComRegistro").val()
    };
    bloquearMesa({seletor: "#mesaGnt"});
    jQuery.ajax({
        type: 'POST', url: '/configuracoes/salvar', data: obj, dataType: 'json', success: function (resp) {
            if (resp.status) {
                modal('configuracaoSucesso', resp.msg, 'sucesso', 1);
            } else {
                if (resp.msg == null) {
                    modal('validacaoInvoiceConf', '<h4>Dados inválidos.</h4>', 'alerta', 1);
                } else {
                    modal('validacaoInvoiceConf', '<h4>' + resp.msg + '</h4>', 'alerta', 1);
                }
            }
            bloquearMesa({
                seletor: "#mesaGnt", funcao: function () {
                    desbloqueiaCliqueElemento("#salvar-configuracoes");
                }
            });
        }
    });
    jQuery.ajax({url: '/configuracoes/removeConfiguracaoSessao', type: 'GET'});
}
function resetaConfiguracoes() {
    modal('resetaConfiguracoes', 'Tem certeza que deseja redefinir as configurações?', 'CONFIRMAÇÃO', 2, 'resetaConfiguracoesConfirmar()', '', 500);
}
function resetaConfiguracoesConfirmar() {
    fecha_cx_gnt();
    removerImagem('resetaConfig');
    salvarConfigsCarrinho('redefinir');
    var obj = {tambol: 'A4', orientacaobol: '1', seqcarne: 'i', redefinir: 's'};
    jQuery.ajax({
        type: 'POST', url: '/configuracoes/salvar', data: obj, dataType: 'json', success: function (resp) {
            if (resp.status) {
                var conteudo = 'Todas as suas configurações foram redefinidas.';
                modal('sucesso_configuracao', conteudo, 'sucesso', 1, 'setRoute("configuracoes/impressao")', '', 550);
            }
        }
    });
}
function salvarConfigsCarrinho(tipo) {
    if (!bloqueiaCliqueElemento("#salvar_carrinho"))return;
    bloquearMesa({seletor: '#corpo-logo'});
    if (tipo == 'redefinir') {
        var logo = '';
    } else {
        var logo = jQuery("#arquivo_carrinhoCompras").val();
    }
    jQuery.post('/configuracoes/alterarLogo', {logo: logo}, function () {
        bloquearMesa({seletor: '#corpo-logo'});
        desbloqueiaCliqueElemento("#salvar_carrinho");
        jQuery("[id=alertMessage]").fadeOut("slow");
        if (tipo != 'redefinir') {
            flashMessage('.titulo-logo', 'antes', 'success', 'Sua logo foi atualizada.');
        }
    });
    jQuery.ajax({url: '/configuracoes/removeConfiguracaoSessao', type: 'GET'});
}
function removerImagem(tipo) {
    jQuery.post('/configuracoes/removerLogoMarca', {}, function () {
        setTimeout(function () {
            jQuery(".imagem-pre-logo img").attr("src", "/imagens/logo-configuracoes.png");
        }, 1000);
        jQuery(".imagem-pre-logo").fadeOut();
        setTimeout(function () {
            jQuery(".imagem-pre-logo").fadeIn();
        }, 1000);
        if (tipo == 'btRemover') {
            flashMessage('.titulo-logo', 'antes', 'alert', 'Para confirmar a exclusão da logo clique em <strong>"Salvar Configurações"</strong>');
        }
        jQuery("#removerArquivo_carrinho").addClass("hide");
        jQuery("#arquivo_carrinhoCompras").val("");
        jQuery(".removerArquivo_carrinho").addClass("hide");
        jQuery("#alertMessage").fadeOut();
        jQuery("#arquivo_carrinhoCompras").removeClass("arquivo_carrinhoCompras_carregado");
        jQuery("#arquivo_carrinhoCompras").addClass("arquivo_carrinhoCompras");
    });
}
function autualizarValoresInstrucoesPagamento() {
    var value_fine = jQuery('#fine').val().replace(",000", ",00");
    var fineValue = jQuery("#formato-multa option:selected").val() == 0 ? "R$ " + value_fine : value_fine + "%";
    var interestFeeValue = jQuery('#interestFee').val().replace(",000", ",00");
    if (jQuery("#interest-fee-status").val() == 1) {
        jQuery('#linha1').val('Sr. Caixa, cobrar juros de ' + interestFeeValue + '% ao dia após vencimento.');
        jQuery('#linha1').prop('disabled', true);
        jQuery('#linha2').val('Para gerar 2ª via do boleto, acesse: https://gerencianet.com.br/segunda-via');
        jQuery('#linha2').prop('disabled', true);
        jQuery('#linha3').prop('disabled', false);
    } else {
        jQuery('#linha1').prop('disabled', false);
        jQuery('#linha1').val('Após o vencimento aceitar somente no banco emissor.');
        jQuery('#linha2').prop('disabled', false);
        jQuery('#linha2').val('Em caso de dúvidas entrem em contato conosco: ' + jQuery('#emailContato').val());
        jQuery('#linha3').prop('disabled', false);
        if (jQuery('#linha3').val() == "Para gerar 2ª via do boleto, acesse: https://fortunus.com.br/2via") {
            jQuery('#linha3').val('');
        } else if (jQuery('#linha3').val() == "Para gerar 2ª via do boleto, acesse: https://gerencianet.com.br/segunda-via") {
            jQuery('#linha3').val('');
        }
    }
    if (jQuery("#fine-status").val() == 1) {
        if (jQuery("#interest-fee-status").val() == 1) {
            jQuery('#linha2').val('Sr. Caixa, cobrar multa de ' + fineValue + ' após vencimento.');
            jQuery('#linha2').prop('disabled', true);
            jQuery('#linha3').val('Para gerar 2ª via do boleto, acesse: https://gerencianet.com.br/segunda-via');
            jQuery('#linha3').prop('disabled', true);
        } else {
            jQuery('#linha1').val('Sr. Caixa, cobrar multa de ' + fineValue + ' após vencimento.');
            jQuery('#linha1').prop('disabled', true);
            jQuery('#linha2').val('Para gerar 2ª via do boleto, acesse: https://gerencianet.com.br/segunda-via');
            jQuery('#linha2').prop('disabled', true);
            if (jQuery('#linha3').val() == "Para gerar 2ª via do boleto, acesse: https://fortunus.com.br/2via") {
                jQuery('#linha3').val('');
            } else if (jQuery('#linha3').val() == "Para gerar 2ª via do boleto, acesse: https://gerencianet.com.br/segunda-via") {
                jQuery('#linha3').val('');
            }
            jQuery('#linha3').prop('disabled', false);
        }
    } else {
        if (jQuery('#linha3').val() == "Para gerar 2ª via do boleto, acesse: https://fortunus.com.br/2via") {
            jQuery('#linha3').val('');
        } else if (jQuery('#linha3').val() == "Para gerar 2ª via do boleto, acesse: https://gerencianet.com.br/segunda-via") {
            jQuery('#linha3').val('');
        }
        jQuery('#linha3').prop('disabled', false);
    }
}
function alternaFormatoMulta() {
    valor = jQuery("#formato-multa option:selected").val();
    if (valor == 1) {
        jQuery("#formato-reais").remove();
        jQuery('<span class="input-group-addon" id="formato-porcentagem">%</span>').insertAfter("#fine");
        jQuery('#fine').setMask({mask: '999,99', type: 'reverse', defaultValue: ''});
    } else {
        jQuery("#formato-porcentagem").remove();
        jQuery('<span class="input-group-addon" id="formato-reais">R$</span>').insertBefore("#fine");
        jQuery("#fine").setMask({mask: '99,999.999', type: 'reverse', defaultValue: ''});
    }
    setMaskMulta();
    autualizarValoresInstrucoesPagamento();
}
function ativarJurosMulta(id_panel) {
    id = "#" + id_panel;
    ehConvenioComRegistro = jQuery("#convenioComRegistro").val();
    if (jQuery(id).hasClass("panel-success")) {
        jQuery(id).removeClass(" panel-success");
        jQuery(id).addClass("panel-default");
        jQuery(id + " a").html('Ativar');
        jQuery(id + " a").removeClass('botao-cinza');
        jQuery(id + " a").addClass('botao-azul');
        jQuery(id + " input").prop('disabled', true);
        jQuery(id + " select").prop('disabled', true);
        if (id_panel == 'panel-juros') {
            if (ehConvenioComRegistro) {
                jQuery("#interestFee").val('0,00000');
            } else {
                jQuery("#interestFee").val('00,000');
            }
            jQuery("#interest-fee-status").val('0');
        } else {
            if (jQuery("#formato-multa option:selected").val() == 0) {
                jQuery("#fine").val('00,00');
            } else {
                jQuery("#fine").val('0,000');
            }
            jQuery("#fine-status").val('0');
        }
    } else {
        if (id_panel == 'panel-juros') {
            jQuery("#interest-fee-status").val('1');
        } else {
            jQuery("#fine-status").val('1');
        }
        jQuery(id + " input").prop('disabled', false);
        jQuery(id + " select").prop('disabled', false);
        jQuery(id).removeClass("panel-default");
        jQuery(id).addClass("panel-success");
        jQuery(id + " a").html('Desativar');
        jQuery(id + " a").removeClass('botao-azul');
        jQuery(id + " a").addClass('botao-cinza');
    }
    if (jQuery("#interest-fee-status").val() == 0 && jQuery("#fine-status").val() == 0) {
        jQuery('#myonoffswitch').val('n');
    } else {
        jQuery('#myonoffswitch').val('s');
    }
    autualizarValoresInstrucoesPagamento();
}
function setMaskMulta() {
    setIniMaskMulta();
    autualizarValoresInstrucoesPagamento();
}
function setIniMaskMulta() {
    valor = jQuery("#fine").val().replace(",", "");
    if (jQuery("#formato-multa option:selected").val() == 0) {
        switch (valor.length) {
            case 1:
                jQuery("#fine").setMask({mask: '9,9', type: 'reverse', defaultValue: ''});
                break
            case 2:
                jQuery("#fine").setMask({mask: '9,99', type: 'reverse', defaultValue: ''});
                break
            case 3:
            case 4:
            case 5:
            default:
                jQuery("#fine").setMask({mask: '99,999', type: 'reverse', defaultValue: ''});
                break;
        }
    } else {
        switch (valor.length) {
            case 1:
                jQuery("#fine").setMask({mask: '9,9', type: 'reverse', defaultValue: ''});
                break
            case 2:
                jQuery("#fine").setMask({mask: '9,99', type: 'reverse', defaultValue: ''});
                break
            case 3:
            case 4:
            case 5:
            default:
                jQuery("#fine").setMask({mask: '99,99', type: 'reverse', defaultValue: ''});
                break;
        }
    }
}
function setMaskJuros() {
    setMaskPorcentagem("interestFee");
    autualizarValoresInstrucoesPagamento();
}
function setMaskPorcentagem(id) {
    valor = jQuery('#' + id).val().replace(",", "");
    switch (valor.length) {
        case 1:
        case 2:
            jQuery('#' + id).setMask({mask: '9,99', type: 'reverse', defaultValue: ''});
            break;
        case 3:
            jQuery('#' + id).setMask({mask: '99,99', type: 'reverse', defaultValue: ''});
            break;
        case 4:
            jQuery('#' + id).setMask({mask: '999,99', type: 'reverse', defaultValue: ''});
            break;
        case 5:
            jQuery('#' + id).setMask({mask: '9999,99', type: 'reverse', defaultValue: ''});
            break;
        case 6:
            jQuery('#' + id).setMask({mask: '99999,99', type: 'reverse', defaultValue: ''});
            break;
        default:
            jQuery('#' + id).setMask({mask: '99999,99', type: 'reverse', defaultValue: ''});
            break;
    }
}