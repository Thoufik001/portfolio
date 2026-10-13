import test from 'node:test';
import assert from 'node:assert/strict';
import {submitContact as contactSubmission} from '../portfolio/sky/contact-submit.js';
const submitContact = (fields, options = {}) => contactSubmission(fields, { ...options, sendEnabled: true });
const fields = {name:' Alex ', email:'alex@example.com', message:' A project idea. '};
const reply = (success, message='', ok=true) => async () => ({ok,json:async()=>({success,message})});
test('design preview never calls the email endpoint', async () => {
 let calls=0;
 const result=await contactSubmission(fields,{fetcher:async()=>{calls++;throw new Error('Email must stay disconnected');}});
 assert.deepEqual(result,{success:true,preview:true});
 assert.equal(calls,0);
});
test('design preview accepts empty fields and mock email text without sending', async () => {
 const fetcher=async()=>{throw new Error('Preview must not send');};
 for(const draft of [{name:'',email:'',message:''},{name:'hi',email:'hi@g.c',message:'hi'}]) {
  assert.deepEqual(await contactSubmission(draft,{fetcher}),{success:true,preview:true});
 }
});
test('accepted submission includes trimmed fields and reply-to', async () => {
 await submitContact(fields,{fetcher:async (url, options)=>{
  assert.equal(url,'https://br-raspy-lab-b4yyotag-contact.compute.c-6.us-east-2.aws.neon.tech/');
  const payload=JSON.parse(options.body);
  assert.equal(payload.name,'Alex');assert.equal(payload.message,'A project idea.');
  assert.equal(payload._replyto,fields.email);
  return {ok:true,json:async()=>({success:'true'})};
 }});
});
test('failed provider responses cannot show success', async () => {
 for (const flag of [false,'false',undefined]) await assert.rejects(submitContact(fields,{fetcher:reply(flag)}),/wasn’t sent/);
 await assert.rejects(submitContact(fields,{fetcher:reply(true,'',false)}),/wasn’t sent/);
});
test('activation is reported as incomplete setup', async () => {
 await assert.rejects(submitContact(fields,{fetcher:reply('true','This form needs Activation.')}),/being set up/);
});
test('invalid or oversized input never reaches the provider', async () => {
 let calls=0;const fetcher=()=>{calls++;};
 for (const invalid of [{...fields,email:'invalid'},{...fields,email:'ok@d.b'},{...fields,message:' '},{...fields,message:'x'.repeat(2001)}]) await assert.rejects(submitContact(invalid,{fetcher}),/check the fields/);
 assert.equal(calls,0);
});
test('network and malformed responses show retry errors', async () => {
 await assert.rejects(submitContact(fields,{fetcher:async()=>{throw new TypeError('Network error');}}),/Check your connection/);
 await assert.rejects(submitContact(fields,{fetcher:async()=>({ok:true,json:async()=>{throw new SyntaxError('Bad JSON');}})}),/Check your connection/);
});
test('closing the form cancels the request', async () => {
 const controller=new AbortController();
 const pending=submitContact(fields,{signal:controller.signal,fetcher:async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))))});
 controller.abort();await assert.rejects(pending,/timed out/);
});
