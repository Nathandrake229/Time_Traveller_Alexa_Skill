/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const https = require('https');
var AmazonDateParser = require('amazon-date-parser');


const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  async handle(handlerInput) {
    
    if(handlerInput.requestEnvelope.request.intent.slots.date.value){
      var vdate = handlerInput.requestEnvelope.request.intent.slots.date.value;
    }
    
    if(handlerInput.requestEnvelope.request.intent.slots.number.value){
     var  vnum = handlerInput.requestEnvelope.request.intent.slots.number.value
    }
    
    if(vdate){
      var responsetext = `The Time Traveller says: `;
    }
    else{
      var responsetext = `The Time Traveller says: <voice name="Matthew"> today </voice>`;
    }
    
    const response = await httpGet(vdate, vnum);
    for(var i =0; i<vnum;i++){
      responsetext += `<voice name="Matthew">In ${response[i].year}, ${response[i].text} </voice> <break time="1s"/>`
      
    }
    responsetext+=" Do you want to try again ?"
    
    return handlerInput.responseBuilder
      //.speak('travelling back in time...')
      .speak(responsetext)
      .withSimpleCard(SKILL_NAME, response[0].text)
      .getResponse();
  },
};
const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'LaunchRequest'
      
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("The TIme Traveller welcomes you. He can tell you what historical events took place in the past on the date of your choice. Do you want to find out?")
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};
const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'The Time Traveller';
//const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say tell me a historical fact about 25th december or any date you want to know about, or, you can say stop...  So, What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    LaunchRequest
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
  function httpGet(udate, unum) {
    return new Promise(((resolve, reject) => {
      if(udate){
        var doc = new AmazonDateParser(udate);
        var options = {
          host: 'history.muffinlabs.com',
          //port: 443,
          path: `/date/${doc.startDate.getMonth()+1}/${doc.startDate.getDate()}`,
          method: 'GET',
      };
      }else{
        var options = {
          host: 'history.muffinlabs.com',
          //port: 443,
          path: "/date",
          method: 'GET',
      };
      }
  
      
      const request = https.request(options, (response) => {
        response.setEncoding('utf8');
        let returnData = '';
  
        response.on('data', (chunk) => {
          returnData += chunk;
        });
  
        response.on('end', () => {
            var res= JSON.parse(returnData)
            console.log(res.data.Events.length)
            var len = res.data.Events.length
            var textar = [];
            for (var i = 0; i < unum; i++){
                var ind = Math.floor(Math.random()*len)
                textar.push({
                  text: res.data.Events[ind].text,
                  year: res.data.Events[ind].year
                })
            }
          console.log(textar)  
            
          resolve(textar);
        });
  
        response.on('error', (error) => {
          reject(error);
        });
      });
      request.end();
    }));
  }