$(document).ready(init);

var payment,
    period,
    botPanel,
    closeBotPanelButton,
    showBotPanelButton,
    messagesArea,
    messageTextArea,
    sendButton,
    responseAPI,
    responsesMap,
    tooltipsElements,
    tooltips;

function showBotPanel() {
    $('body').addClass('bot-panel-open');
}

function hideBotPanel() {
    $('body').removeClass('bot-panel-open');
}

function addUserMessage(event) {
    event.preventDefault();
    var messageText = messageTextArea.value;
    
    if (messageText.length < 2) {
        alert('Your message is too short');
    } else {
        addMessage(messageText, true);
    }
    messageTextArea.value = '';
}

function addMessage(html, isSenderUser) {
    var elem = document.createElement('div');
    $(elem).addClass('message');
    
    if (!isSenderUser) {
        $(elem).addClass('bot-message');

        elem.innerHTML = '...';
        setTimeout(function () {
            $(messagesArea).append(elem);
            $(messagesArea).scrollTop(messagesArea.scrollHeight);
        }, 300);
        
        setTimeout(function () {
            var parsedHTML = $.parseHTML(html);
            elem.innerHTML = '';
            $(elem).append(parsedHTML);
            initChatLinks(elem);
        }, 1000);
    } else {
        elem.innerHTML = html;
        messagesArea.appendChild(elem);
    }

    $(messagesArea).scrollTop(messagesArea.scrollHeight);
    
    if (isSenderUser) {
        getAnswer(html);
    }
}
 
function getAnswer(request) {
    var isApiRequestFound = false;
    for (var key in responseAPI) {
        var lowerCaseKey = key.toLowerCase();
        var lowerCaseRequest = request.toLowerCase();
        if (lowerCaseRequest.search(lowerCaseKey) != -1) {
            isApiRequestFound = true;
            addMessage(responseAPI[key], false);
            var formula = responseAPI[key + ' formula'];
            if (formula) {
                setTimeout(function () {
                    addMessage(formula, false);
                }, 1300);
            }
        }
    }
    
    if (!isApiRequestFound) {
        addMessage('I\'m sorry, could you specify your question?', false);
    }
}

function initChatLinks(elem) {
    $(elem).find('.term-link').on('click', function (event) {
        event.preventDefault();
        getAnswer($(this).attr('href'));
    })
}

function updatedSelectedPlan() {
    var elem = $(this);
    var currentPrice = elem.find('.price .value').text();
    var currentRadio = elem.find('input').get(0);
    var currentPeriod = elem.find('.time-period span').text();
    
    $(payment).text(currentPrice);
    $(period).text('for ' + currentPeriod + ' Month');
    $(currentRadio).prop('checked', true);
}

function toggleHighlight(event) {
    if (event.type == 'keydown' && event.keyCode == 18) {
        $('body').addClass('highlight-terms');
    } else if (event.type == 'keyup' && event.keyCode == 18) {
        $('body').removeClass('highlight-terms');
    }
}

function addTooltip(event) {
    var tooltipElement = document.createElement('div');
    var tooltipId = $(this).attr('data-term-id');
    var tooltipHTML = $.parseHTML(tooltips[tooltipId]);
    var toolTipLink = document.createElement('a');
    $(toolTipLink).attr('href', tooltipId).addClass('tooltip-link').text('Discuss it');
    
    if (event.type == 'mouseenter') {
        $(tooltipElement).addClass('tooltip');
        this.appendChild(tooltipElement);
        $(tooltipElement).append(tooltipHTML);
        if (responsesMap[tooltipId]) {
            $(tooltipElement).append(toolTipLink);
            $(toolTipLink).on('click', function (event) {
                event.preventDefault();
                getAnswer(responsesMap[tooltipId]);
            });
        }
    } else {
        $(this).children('.tooltip').remove();
    }
}

function initHandlers(content) {
    $(content).on('click', '.lease-card', updatedSelectedPlan);
    $(closeBotPanelButton).on('click', hideBotPanel);
    $(showBotPanelButton).on('click', showBotPanel);
    $(sendButton).on('click', addUserMessage);
    $(window).on('keydown', toggleHighlight);
    $(window).on('keyup', toggleHighlight);
    $(tooltipsElements).hover(addTooltip);
}

function init() {
    var content= $('.content').get(0);
    payment = $('.monthly-payment-value').get(0);
    period = $('.monthly-payment .period').get(0);
    botPanel = $('.bot-panel').get(0);
    closeBotPanelButton = $('.close-panel').get(0);
    showBotPanelButton = $('.bot-button').get(0);
    messagesArea = $('.messages').get(0);
    messageTextArea = $('.message-area').get(0);
    sendButton = $('.send-message').get(0);
    tooltipsElements = $('.term');
    showBotPanel();
    
    initHandlers(content);
}

responseAPI = {
    'hi': 'Hello',
    'how are you': 'Fine, thanks!',
    'what are you doing': 'At the moment i\'m looking answer to your question',
    'down payment': '<div class="title">Down Payment</div> Typycally, a down payment for a leased vehicle reduces the' +
        'remaining balance for the car, for wich you will be paying monthly installments',
    'msrp': '<div class="title">MSRP</div> The manufacturer\'s suggested retail price , or the recommended retail ' +
        'price (RRP), or the suggested retail price (SRP), of a product is the price at which the manufacturer ' +
        'recommends that the retailer sell the product.',
    'monthly payment': '<div class="title">Monthly Payment</div> amount that should be payed monthly, calculates ' +
        'differential depending on different conditions',
    'monthly payment formula': '<div class="normal-title">Monthly Payment calculates:</div>' +
        'Monthly Payment = <a href="pretax lease" class="term-link">Pretax Lease Payment</a> * local tax rate',
    'miles per year': '<div class="title">Miles Per Year</div>Lease offer annual mileage limit. There is the ' +
        'cost-per-mile penalty for exceeding the limit',
    'residual': '<div class="title">The residual value</div>If you lease a car for three years, its residual value is ' +
        'how much it is worth after three years. ' +
        'The residual value is determined by the bank that issues the lease before the lease begins. ' +
        'residualValue = msrp * residualValuePersentage',
    'percentage': '<div class="normal-title">Residual percentage</div>The residual percent is set by dealer for particular inventory.',
    'residual formula': '<div class="normal-title">Residual value calculates:</div>Residual Value = ' +
        '<a href="msrp" class="term-link">MSRP</a> * <a href="percentage" class="term-link">Residual Value Percentage</a>',
    'pretax lease': '<div class="normal-title">Pretax Lease calculates:</div>Pretax Lease = ' +
        '<a href="base payment" class="term-link">Base Payment</a> + <a href="rent charge" class="term-link">Rent Charge</a>',
    'base payment': '<div class="normal-title">Base Payment calculates:</div>Base Payment = ' +
        '<a href="depreciation amount" class="term-link">Depreciation Amount</a> / <a href="term" class="term-link">Term</a>',
    'rent charge': '<div class="normal-title">Rent Charge calculates:</div>' +
        'Rent Charge = (<a href="adjusted capitalized cost" class="term-link">Adjusted Capitalized Cost</a>' +
        ' + <a href="residual" class="term-link">Residual Value</a>) * ' +
        '<a href="money factor" class="term-link">Money Factor</a>',
    'depreciation amount': '<div class="normal-title">Depreciation Amount calculates:</div>' +
        'Depreciation Amount = <a href="adjusted capitalized cost" class="term-link">Adjusted Capitalized Cost</a> - ' +
    '<a href="residual" class="term-link">Residual Value</a>',
    'term': '<div class="normal-title">Term</div>Period of leasing, months',
    'adjusted capitalized cost': '<div class="normal-title">Adjusted Capitalized Cost calculates:</div>Adjusted Capitalized Cost = ' +
        '<a href="gross capitalized cost" class="term-link">Gross Capitalized Cost</a> - ' +
        '<a href="capitalized cost reduction" class="term-link">Capitalized Cost Reduction</a>',
    'gross capitalized cost': '<div class="normal-title">Gross Capitalized Cost calculates:</div>Sale price + Fees',
    'capitalized cost reduction': '<div class="normal-title">Capitalized Cost Reduction calculates:</div>' +
        '<a href="down payment" class="term-link">Down payment</a> + Trade In + Rebates',
    'money factor': '<div class="title">Money Factor</div>Money factor, which is sometimes called “lease factor” or ' +
        'simply “factor”, determines how much you’ll pay in finance charges each month during your lease. The higher the ' +
        'money factor, the higher your monthly payment and the more you’ll pay in total finance charges. Therefore, when ' +
        'shopping for a lease, you’ll want to look for the lowest money factor',
    'fee': '<div class="title">Fee Graphic</div><div class="graphic"><div class="c100 p12 small"><span>$16,475</span>' + 
        '<div class="slice"> <div class="bar"></div> <div class="bar2"></div> <div class="fill"></div> </div> ' +
        '</div> </div> <div class="formula-values">$16,475 = <span>33,000<a href="msrp" class="term-link">msrp</a>' +
        '</span> * 53% + <span>10,000<a href="monthly payment" class="term-link">monthly</a></span> * 0,2 + ' +
        '<span>300<a href="fee" class="term-link">fee</a></span> </div>'
};

tooltips = {
    'down-payment': 'Typically, a down payment for a leased vehicle reduces the remaining balance for the car, for ' +
        'which you will be paying monthly installments',
    'residual': 'If you lease a car for three years, its residual value is how much it is worth after three years. ' +
        'The residual value is determined by the bank that issues the lease before the lease begins. ',
    'miles-year': 'Lease offer annual mileage limit. There is the cost-per-mile penalty for exceeding the limit',
    'msrp': 'The manufacturer\'s suggested retail price , or the recommended retail price (RRP), or the ' +
        'suggested retail price (SRP), of a product is the price at which the manufacturer recommends that the ' +
        'retailer sell the product.',
    'monthly-payment': 'Amount that should be payed monthly, calculates ' +
        'differential depending on different conditions'
};

responsesMap = {
    'down-payment': 'down payment',
    'msrp': 'msrp',
    'monthly-payment': 'monthly payment',
    'miles-year': 'miles per year',
    'residual': 'residual'
};
