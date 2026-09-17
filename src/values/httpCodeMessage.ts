/** --------------------------------------------------------------------------------------------------------------------
 * @file httpCodeMessage.ts
 * @fileOverview this fiel will repesent string message for each http code in funy way.
 * @author Arash Goharrostami
 * @create 2025-03-15
 */

/** --------------------------------------------------------------------------------------------------------------------
 * @define just define my interface
 */
interface HttpCodeMessages {
  [key: number]: string;
}

/** --------------------------------------------------------------------------------------------------------------------
 * @description main const variable of this file.
 */
const httpCodeMessage: HttpCodeMessages = {
  100: 'Hold on, still thinking...',
  101: 'Switching things up!',
  102: 'Processing... Give me a sec!',
  103: 'Early hints, but no spoilers!',
  200: 'Yay! It worked! 🎉',
  201: 'Congratulations! You made something new!',
  202: 'I got your request, but I’m gonna do it later... maybe.',
  203: "This might not be accurate, just sayin'.",
  204: 'Nothing to see here, move along.',
  205: 'Reset your view, start fresh!',
  206: 'Here’s part of what you wanted, not all.',
  300: 'Can’t decide? Here are some choices!',
  301: 'I packed my bags and left forever. Redirecting...',
  302: 'I moved, but I might come back. Redirecting...',
  303: 'See another page instead!',
  304: 'Nothing changed, use what you already got!',
  305: 'Use a proxy, I won’t talk to you directly!',
  307: 'Temporary redirect, but I’ll be back!',
  308: 'Permanent redirect, don’t come back here again!',
  400: 'Dude, what are you even asking me?',
  401: 'Who do you think you are? 🤨',
  402: 'Pay up or get out! 💰',
  403: 'Nope, you can’t go here. 🚫',
  404: "I looked everywhere… it's gone! 🕵️‍♂️",
  405: "I see what you did there. Don't do that.",
  406: 'I don’t like what you’re asking for!',
  407: 'Who’s your proxy? Go through them first!',
  408: 'You took too long! Timeout! ⏳',
  409: 'Conflict! Figure it out and try again!',
  410: 'Gone. Poof! Forever!',
  411: 'Tell me how long your request is!',
  412: 'Precondition failed. Don’t assume things!',
  413: 'Whoa, that request is WAY too big!',
  414: 'That URL is just too long!',
  415: 'I don’t understand this file format!',
  416: 'Requested range not acceptable, try again!',
  417: 'Expectation failed. I’m disappointed...',
  418: "I can’t brew coffee, I'm a teapot! 🍵",
  419: 'Session’s gone stale! Log in and try again 🕰️',
  420: 'Chill, Twitter’s API is rate-limiting you. 🧘',
  422: 'Well, this is awkward. Your data is too weird for us to handle. Please fix it. \uD83E\uDD74',
  425: 'Too early! Wait a bit!',
  426: 'Upgrade required! Get the latest version!',
  427: "Too Late! She's Gone",
  428: 'Precondition required! Missing something?',
  429: 'Whoa, slow down! You’re spamming me!',
  431: 'Your request headers are too big!',
  451: 'Censored! The government says no. 🚔',
  500: 'I broke. It’s not you, it’s me.',
  501: 'I can’t do that, Dave...',
  502: 'The gateway broke! Blame someone else!',
  503: 'I’m on a break. Try later!',
  504: 'Gateway timeout. It took too long!',
  505: 'I don’t support this HTTP version!',
  506: 'Variant also negotiates… whatever that means!',
  507: 'Dude, I’m out of space! 🧹',
  508: 'Infinite loop detected! Stop it!',
  510: 'Extend your request, it’s missing something!',
  511: 'You need to log in first!',
};

/** --------------------------------------------------------------------------------------------------------------------
 * @description export main constant vareable as default
 * @export
 */
export default httpCodeMessage;
