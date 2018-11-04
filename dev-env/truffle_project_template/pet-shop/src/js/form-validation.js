$(function() {
  $(window).load(function() {

    $('#insertionForm').validate({

      //Default class applied to an invalid input
      errorClass: "my-error-class",

      // Specify validation rules
      rules: {
        // The key name on the left side is the name attribute
        // of an input field. Validation rules are defined
        // on the right side

        formControlCulturalGoodImgInsert:{
          extension: "png|jpg|jpeg|gif"
        },

        formControlCulturalGoodCategoryInsert:{
          required: true
        },

        formControlCulturalGoodCategorySearch: {
          required: true
        },

        formControlCulturalGoodDisciplinarySectorInsert:{
          required: true
        },

        formControlCulturalGoodDisciplinarySectorSearch: {
          required: true
        },

        formControlCulturalGoodTypologyInsert:{
          required: true,
          typologyCheck: true
        },

        formControlCulturalGoodTypologySearch: {
          required: true,
          typologyCheckSearch: true
        },

        formControlCulturalGoodCdNctNctr:{
          required: true,
          minlength: 2,
          maxlength: 2,
          digits: true
        },

        formControlCulturalGoodCdNctNctn:{
          required: true,
          minlength: 8,
          maxlength: 8,
          digits: true
        },

        formControlCulturalGoodCdNctNcts: {
          minlength: 1,
          maxlength: 2,
          lettersonly: true
        },

        formControlCulturalGoodAuAtbAtbd: {
          letterswithbasicpunc: true,
          maxlength: 50
        },

        formControlCulturalGoodTuCdgCdgg: {
          required: true
        },

        formControlCulturalGoodOgOgtOgtd: {
          required: true,
          letterswithbasicpunc: true,
          maxlength: 70
        },

        formControlCulturalGoodOgSgtSgti:{
          letterswithbasicpunc: true,
          maxlength: 250
        },

        formControlCulturalGoodDaDes: {
          required: true,
          maxlength: 3250
        },

        formControlCulturalGoodLcPvcPvcs: {
          required: true,
          lettersonly: true,
          maxlength: 50
        },

        formControlCulturalGoodLcPvcPvcr: {
          abroadCheck: true,
          withinTheBordersCheck: true,
        },


        formControlCulturalGoodLcPvcPvcp: {
          abroadCheck: true,
          withinTheBordersCheck: true,
          lettersonly: true,
          minlength: 2,
          maxlength: 2
        },

        formControlCulturalGoodLcPvcPvcc: {
          abroadCheck: true,
          withinTheBordersCheck: true,
          lettersAndAccentedLettersOnlyWithinTheBordersCheck: true,
          maxlength: 50
        },

        formControlCulturalGoodLcPvcPvcl: {
          abroadCheck: true,
          lettersAndAccentedLettersOnlyWithinTheBordersCheck: true,
          maxlength: 50
        },

        formControlCulturalGoodLcPvcPvce: {
          abroadCheckV2: true,
          lettersAndAccentedLettersOnlyAbroadCheck: true,
          maxlength: 250
        },

        formControlCulturalGoodLcLdcLdct: {
          lettersonly: true,
          maxlength: 50
        },

        formControlCulturalGoodLcLdcLdcq: {
          lettersonly: true,
          maxlength: 50
        },

        formControlCulturalGoodLcLdcLdcn: {
          denominationRaCheck: true,
          letterswithbasicpunc: true,
          maxlength: 80
        },

        formControlCulturalGoodLcLdcLdcc: {
          letterswithbasicpunc: true,
          maxlength: 80
        },

        formControlCulturalGoodLcLdcLdcu: {
          addressOaCheck: true,
          maxlength: 250
        }, 

        formControlCulturalGoodLcLdcLdcm: {
          letterswithbasicpunc: true,
          maxlength: 70
        },

        formControlCulturalGoodLcLdcLdcs: {
          maxlength: 250
        },

        formControlCulturalGoodDtDtsDtsi: {
          dateOaCheck: true,
          dateRaCheck: true
        },

        formControlCulturalGoodDtDtsDtsf: {
          dateOaCheck: true,
          dateRaCheck: true
        },

        formControlCulturalGoodMtMtc: {
          required: true,
          maxlength: 150
        },

        formControlCulturalGoodAdAdsAdsp: {
          required: true
        }

      },
      // Specify validation error messages
      messages: {

        formControlCulturalGoodImgInsert: {
          extension: "Estensione non valida"
        },

        formControlCulturalGoodCategoryInsert:{
          required: "Categoria non valida"
        },

        formControlCulturalGoodCategorySearch:{
          required: "Categoria non valida"
        },

        formControlCulturalGoodDisciplinarySectorInsert:{
          required: "Settore Disciplinare non valido"
        },

        formControlCulturalGoodTypologyInsert: {
          required: "Tipologia non valida"
        },

        formControlCulturalGoodCdNctNctr: {
          required: "Campo obbligatorio",
          minlength: "Minimo numero di caratteri non valido",
          maxlength: "Massimo numero di caratteri non valido",
          digits: "Ammessi solo numeri"
        },

        formControlCulturalGoodCdNctNctn: {
          required: "Campo obbligatorio",
          minlength: "Minimo numero di caratteri non valido",
          maxlength: "Massimo numero di caratteri non valido",
          digits: "Ammessi solo numeri"
        },

        formControlCulturalGoodCdNctNcts: {
          minlength: "Minimo numero di caratteri non valido",
          maxlength: "Massimo numero di caratteri non valido",
          lettersonly: "Ammesse solo lettere"
        },

        formControlCulturalGoodAuAtbAtbd: {
          maxlength: "Massimo numero di caratteri non valido",
          letterswithbasicpunc: "Ammesse solo lettere e segni di punteggiatura"
        },

        formControlCulturalGoodTuCdgCdgg: {
          required: "Campo obbligatorio"
        },

        formControlCulturalGoodOgOgtOgtd: {
          required: "Campo obbligatorio",
          letterswithbasicpunc: "Ammesse solo lettere e segni di punteggiatura",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodOgSgtSgti: {
          letterswithbasicpunc: "Ammesse solo lettere e segni di punteggiatura",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodDaDes:{
          required: "Campo obbligatorio",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcPvcPvcs:{
          required: "Campo obbligatorio",
          lettersonly: "Ammesse solo lettere",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcPvcPvcp: {
          required: "Campo obbligatorio",
          lettersonly: "Ammesse solo lettere",
          minlength: "Minimo numero di caratteri non valido",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcPvcPvcc: {
          required: "Campo obbligatorio",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcPvcPvcl:{
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcPvcPvce: {
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcLdcLdct:{
          lettersonly: "Ammesse solo lettere",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcLdcLdcq: {
          lettersonly: "Ammesse solo lettere",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcLdcLdcn: {
          letterswithbasicpunc: "Ammesse solo lettere e segni di punteggiatura",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcLdcLdcc: {
          letterswithbasicpunc: "Ammesse solo lettere e segni di punteggiatura",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcLdcLdcu: {
          maxlength: "Massimo numero di caratteri non valido"
        }, 

        formControlCulturalGoodLcLdcLdcm: {
          letterswithbasicpunc: "Ammesse solo lettere e segni di punteggiatura",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodLcLdcLdcs: {
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodDtDtsDtsi: {
          dateITA: "Formato non valido"
        },

        formControlCulturalGoodDtDtsDtsf: {
          dateITA: "Formato non valido"
        },

        formControlCulturalGoodMtMtc: {
          required: "Campo obbligatorio",
          maxlength: "Massimo numero di caratteri non valido"
        },

        formControlCulturalGoodAdAdsAdsp: {
          required: "Campo obbligatorio"
        }

      },

      submitHandler: function(form) {
        if (App.insertionFormSubmitted == false) {
          App.insertionFormSubmitted = true;
        }
        if(App.localStorage.getItem('isOATransactionAccepted') == null || App.localStorage.getItem('isRATransactionAccepted') == null) {
          alert('Per finalizzare la migrazione dati inziale risulta necessario memorizzare le operazioni eseguite in blockchain.');
           App.finalizeDataMigration();
        } else {
          //let previouslyImgPath = $("#insertNewCulturalGood").find('.btn-insertCulturalGood').data('imgurl');
          //console.log($("#insertNewCulturalGood").find('.btn-insertCulturalGood').data('imgurl'));
          //alert('imgUrl: ' + imgUrl);
          App.insertDocument();
        }
        //form.submit();
      }
    });

    jQuery.validator.addMethod('typologyCheck', function (value, element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni storici e artistici' && 
                  $(element).val() == 'Reperto archeologico') 
                  ||
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni archeologici' && 
                  $(element).val() == 'Opera e oggetto d\'Arte')
                ); 
    }, "Tipologia non valida");

    

    jQuery.validator.addMethod('requiredWithinRA', function (value, element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni storici e artistici' &&  
                  $('#formControlCulturalGoodTypologyInsert').val() == 'Opera e oggetto d\'Arte' &&
                  $(element).val() != '')
                ); 
    }, "Campo non valido con tipologia: 'Opera e oggetto d\'Arte'");


    jQuery.validator.addMethod('abroadCheck', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodLcPvcPvcs').val().toLowerCase() != 'italia' &&
                  $(element).val() != '')
                ); 
    }, "Campo non valido con Stato diverso da: 'Italia'");

    jQuery.validator.addMethod('withinTheBordersCheck', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodLcPvcPvcs').val().toLowerCase() == 'italia' &&
                  $(element).val() == '')
                ); 
    }, "Campo obbligatorio");

    jQuery.validator.addMethod('lettersAndAccentedLettersOnlyWithinTheBordersCheck', function (value, element) {
      if (($('#formControlCulturalGoodLcPvcPvcs').val().toLowerCase() == 'italia') && $(element).val() != '') {
        return  ( 
                  /^[a-zA-Z\sàèéíòù]+$/.test($(element).val())
                ); 
      }
      return true;
    }, "Ammesse solo lettere e spazi");

    jQuery.validator.addMethod('lettersAndAccentedLettersOnlyAbroadCheck', function (value, element) {
        if(($('#formControlCulturalGoodLcPvcPvcs').val().toLowerCase() != 'italia') && $(element).val() != '') {
          return ( 
                   /^[a-zA-Z\sàèéíòù]+$/.test($(element).val())
                 ); 
        }
        return true;
    }, "Ammesse solo lettere e spazi");

    jQuery.validator.addMethod('abroadCheckV2', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodLcPvcPvcs').val().toLowerCase() == 'italia' &&
                  $(element).val() != '')
                ); 
    }, "Campo non valido con Stato: 'Italia'");

    jQuery.validator.addMethod('addressOaCheck', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni storici e artistici' && 
                  $('#formControlCulturalGoodTypologyInsert').val() == 'Opera e oggetto d\'Arte' &&
                  $(element).val() == '')
                ); 
    }, "Campo obbligatorio");

    jQuery.validator.addMethod('denominationRaCheck', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni archeologici' && 
                  $('#formControlCulturalGoodTypologyInsert').val() == 'Reperto archeologico' &&
                  ($('#formControlCulturalGoodLcLdcLdct').val() != '' || $('#formControlCulturalGoodLcLdcLdcq').val() != '' 
                  || $('#formControlCulturalGoodLcLdcLdcc').val() != '' || $('#formControlCulturalGoodLcLdcLdcu').val() != ''
                  || $('#formControlCulturalGoodLcLdcLdcm').val() != '' || $('#formControlCulturalGoodLcLdcLdcs').val() != '')
                  &&
                  $(element).val() == '')
                ); 
    }, "Campo obbligatorio");

    jQuery.validator.addMethod('dateOaCheck', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni storici e artistici' && 
                  $('#formControlCulturalGoodTypologyInsert').val() == 'Opera e oggetto d\'Arte' &&
                  $(element).val() == '')
                ); 
    }, "Campo obbligatorio");

    jQuery.validator.addMethod('dateRaCheck', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorInsert').val() == 'Beni archeologici' && 
                  $('#formControlCulturalGoodTypologyInsert').val() == 'Reperto archeologico' &&
                  ($('#formControlCulturalGoodDtDtsDtsv').val() != '' || 
                  $('#formControlCulturalGoodDtDtsDtsl').val() != '') 
                  &&
                  $(element).val() == '')
                ); 
    }, "Campo obbligatorio");

    jQuery.validator.addMethod('typologyCheckSearch', function (value, element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorSearch').val() == 'Beni storici e artistici' && 
                  $(element).val() == 'Reperto archeologico') 
                  ||
                  ($('#formControlCulturalGoodDisciplinarySectorSearch').val() == 'Beni archeologici' && 
                  $(element).val() == 'Opera e oggetto d\'Arte')
                ); 
    }, "Tipologia non valida");


    $('#searchForm').validate({

      //Default class applied to an invalid input
      errorClass: "my-error-class",

      // Specify validation rules
      rules: {
        // The key name on the left side is the name attribute
        // of an input field. Validation rules are defined
        // on the right side
        
        formControlCulturalGoodCategorySearch: {
          required: true
        },

        formControlCulturalGoodDisciplinarySectorSearch: {
          required: true
        },

        formControlCulturalGoodTypologySearch: {
          required: true,
          typologyCheckSearch: true
        },

        formControlCulturalGoodLcPvcPvcsSearch: {
          required: true,
          lettersonly: true,
          maxlength: 50
        },

        formControlCulturalGoodLcPvcPvcrSearch: {
          abroadCheckSearch: true,
          withinTheBordersCheckSearch: true
        }

      },
      // Specify validation error messages
      messages: {

        formControlCulturalGoodCategorySearch:{
          required: "Categoria non valida"
        },

        formControlCulturalGoodDisciplinarySectorSearch: {
          required: "Settore Disciplinare non valido"
        },

        formControlCulturalGoodTypologySearch: {
          required: "Tipologia non valida"
        },

        formControlCulturalGoodLcPvcPvcsSearch: {
          required: "Campo obbligatorio",
          lettersonly: "Ammesse solo lettere",
          maxlength: "Massimo numero di caratteri non valido"
        }

      },
      
      submitHandler: function(form) {

        if(App.localStorage.getItem('isOATransactionAccepted') == null || App.localStorage.getItem('isRATransactionAccepted') == null) {
          alert('Per poter procedere è necessario finalizzare la migrazione dati inziale.');
           App.finalizeDataMigration();
        }else {
          App.searchDocuments();
        }
        //form.submit();
      }
    });


    jQuery.validator.addMethod('typologyCheckSearch', function (value, element) {
        return !(
                  ($('#formControlCulturalGoodDisciplinarySectorSearch').val() == 'Beni storici e artistici' && 
                  $(element).val() == 'Reperto archeologico') 
                  ||
                  ($('#formControlCulturalGoodDisciplinarySectorSearch').val() == 'Beni archeologici' && 
                  $(element).val() == 'Opera e oggetto d\'Arte')
                ); 
    }, "Tipologia non valida");

    jQuery.validator.addMethod('abroadCheckSearch', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodLcPvcPvcsSearch').val().toLowerCase() != 'italia' &&
                  $(element).val() != '')
                ); 
    }, "Campo non valido con Stato diverso da: 'Italia'");

    jQuery.validator.addMethod('withinTheBordersCheckSearch', function (value,element) {
        return !(
                  ($('#formControlCulturalGoodLcPvcPvcsSearch').val().toLowerCase() == 'italia' &&
                  $(element).val() == '')
                ); 
    }, "Campo obbligatorio");

  });
});