
import type { RequestData, Turn } from '../shared/contracts.js';
import { ScreenDocument } from '../shared/openui/document.js';

export function mockTurn(request: RequestData, fixture: string): Turn {
  const last = request.messages.at(-1)?.content.trim().toLowerCase() ?? '';
  console.log('[AiRA mock] Received:', last);
  const fence = (code: string) => '```openui\n' + code + '\n```';

  if (last === 'load wiring sample' || last === '/demo') {
    return {
      reply:
        'Wiring fixture loaded. This is deterministic, not a model interpreting your skill.\n' +
        fence('root = Screens([])') +
        '\n' +
        fence(fixture),
    };
  }

  const doc = new ScreenDocument();

  if (request.state.ui_state) {
    doc.apply(fence(request.state.ui_state));
  }

  const screens = doc.screens;
  const index = screens.findIndex((s) => s.key === doc.cursor);

  if (last === 'next' || last === 'continue') {
    if (screens.length && index < screens.length - 1) {
      const target = screens[index + 1];
      return {
        reply:
          'Let’s continue at your own pace.\n' +
          fence(
            `root = Screens([${screens.map((s) => s.key).join(', ')}], ${target.key})`,
          ),
      };
    }
  }

  if (last === 'back') {
    if (screens.length && index > 0) {
      const target = screens[index - 1];
      return {
        reply:
          'Taking you back one step.\n' +
          fence(
            `root = Screens([${screens.map((s) => s.key).join(', ')}], ${target.key})`,
          ),
      };
    }
  }

  if (last === 'pause session' || last === 'pause') {
    return {
      reply:
        'Your session is paused. There is no rush. Choose Continue whenever you are ready.\n' +
        fence(
          'root = Screens([welcome, choose, intro, stage1, stage2, stage3, complete], intro)',
        ),
    };
  }

  if (
    last === 'start quick reset' ||
    last === 'quick reset' ||
    last === 'start mobility flow' ||
    last === 'mobility flow' ||
    last === 'start mindful cooldown' ||
    last === 'mindful cooldown' ||
    last === 'start session'
  ) {
    const choice = last.includes('mobility')
      ? 'Mobility Flow'
      : last.includes('cooldown')
        ? 'Mindful Cooldown'
        : 'Quick Reset';

    return {
      reply:
        `You selected ${choice}. This is a fictional, screen-guided experience with no physical instructions.\n` +
        fence('root = Screens([])') +
        '\n' +
        fence(`
root = Screens([welcome, choose, intro, stage1, stage2, stage3, complete])
welcome = Screen([welcomeTitle, welcomeText])
welcomeTitle = Text("AiRA", "title")
welcomeText = Text("Your personal pause. A fictional guided experience.", "description")
choose = Screen([chooseTitle, chooseText, choices])
chooseTitle = Text("Choose your session", "title")
chooseText = Text("${choice} is ready when you are.", "body")
choices = FollowUps(["Begin session", "Back to welcome"])
intro = Screen([introTitle, introText, introNote])
introTitle = Text("${choice}", "title")
introText = Text("A gentle, fictional journey through three mindful moments.", "description")
introNote = Alert("info", "No exercise is performed or prescribed. This prototype simulates the experience.")
stage1 = Screen([stage1Title, stage1Count, stage1Text, stage1Cue, stage1Next])
stage1Title = Text("Moment 1 · Arrive", "title")
stage1Count = Keyword("01", "Your first moment")
stage1Text = Text("Settle into the experience. Nothing to perform and nothing to get right.", "body")
stage1Cue = Cue("Welcome. This is your time, and you can move at your own pace.")
stage1Next = FollowUps(["Continue", "Pause session", "Finish session"])
stage2 = Screen([stage2Title, stage2Count, stage2Text, stage2Cue, stage2Next])
stage2Title = Text("Moment 2 · Reset", "title")
stage2Count = Keyword("02", "Your second moment")
stage2Text = Text("Take a quiet moment to notice the present. This is a simulated guidance screen.", "body")
stage2Cue = Cue("There is no target to reach. Simply take this moment as it comes.")
stage2Next = FollowUps(["Continue", "Pause session", "Finish session"])
stage3 = Screen([stage3Title, stage3Count, stage3Text, stage3Cue, stage3Next])
stage3Title = Text("Moment 3 · Reflect", "title")
stage3Count = Keyword("03", "Your final moment")
stage3Text = Text("You have reached the final guided moment in this fictional session.", "body")
stage3Cue = Cue("Thank you for taking a moment for yourself.")
stage3Next = FollowUps(["Finish session", "Back"])
complete = Screen([completeTitle, completeText, completeCount, completeNext])
completeTitle = Text("Session complete", "title")
completeText = Text("You made space for a moment of calm. Your simulated session is complete.", "description")
completeCount = Keyword("03 / 03", "Guided moments completed")
completeNext = FollowUps(["Start Quick Reset", "Back to welcome"])
`),
    };
  }

  if (last === 'begin session') {
    return {
      reply:
        'Your session begins with the first guided moment.\n' +
        fence(
          'root = Screens([welcome, choose, intro, stage1, stage2, stage3, complete], stage1)',
        ),
    };
  }

  if (last === 'finish session') {
    return {
      reply:
        'Your fictional session is complete. No physical activity was performed.\n' +
        fence(
          'root = Screens([welcome, choose, intro, stage1, stage2, stage3, complete], complete)',
        ),
    };
  }

  if (last === 'back to welcome') {
    return {
      reply:
        'Welcome back to AiRA. Choose a fictional session whenever you are ready.\n' +
        fence(
          'root = Screens([welcome, choose, intro, stage1, stage2, stage3, complete], welcome)',
        ),
    };
  }


  if (/^change value to \d{1,2}$/.test(last) && doc.program.includes('count1 =')) {
    const value = Number(last.match(/\d+/)![0]);

    return {
      reply:
        'Fixture values patched under their existing names.\n' +
        fence(
          `count1 = Keyword("${value}", "Sample value")
  count2 = Keyword("${value}", "Second sample value")`,
        ),
    };
  }


  return {
  reply:
    'Welcome to AiRA. Start a fictional guided experience or explore the sample. Mock mode does not read your skill or interpret arbitrary messages.\n' +
    fence(`
root = Screens([welcome, choose])
welcome = Screen([welcomeTitle, welcomeText, welcomeNote, welcomeChoices])
welcomeTitle = Text("Meet AiRA", "title")
welcomeText = Text("A calmer kind of guided experience.", "description")
welcomeNote = Alert("info", "Local prototype · Simulated interactions only")
welcomeChoices = FollowUps(["Start Quick Reset", "Start Mobility Flow", "Start Mindful Cooldown", "Load wiring sample"])
choose = Screen([chooseTitle, chooseText, chooseChoices])
chooseTitle = Text("Your experience", "title")
chooseText = Text("Choose a fictional session to preview its guided flow.", "body")
chooseChoices = FollowUps(["Start Quick Reset", "Start Mobility Flow", "Start Mindful Cooldown"])
`),
};
}
