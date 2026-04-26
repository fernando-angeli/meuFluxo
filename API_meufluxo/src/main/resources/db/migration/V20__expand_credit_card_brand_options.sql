alter table credit_cards
    drop constraint if exists credit_cards_brand_card_check;

alter table credit_cards
    add constraint credit_cards_brand_card_check
    check (
        brand_card in (
            'VISA',
            'MASTERCARD',
            'ELO',
            'AMERICAN_EXPRESS',
            'HIPERCARD',
            'DINERS_CLUB',
            'DISCOVER',
            'BANRICOMPRAS',
            'CABAL',
            'AURA',
            'JCB',
            'UNIONPAY',
            'OUTRO'
        )
    );
