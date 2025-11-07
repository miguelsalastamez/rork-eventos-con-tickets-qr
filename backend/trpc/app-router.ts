import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import loginRoute from "./routes/auth/login/route";
import registerRoute from "./routes/auth/register/route";
import meRoute from "./routes/auth/me/route";
import createTestUserRoute from "./routes/auth/create-test-user/route";

import listEventsRoute from "./routes/events/list/route";
import getEventRoute from "./routes/events/get/route";
import createEventRoute from "./routes/events/create/route";
import updateEventRoute from "./routes/events/update/route";
import deleteEventRoute from "./routes/events/delete/route";

import listAttendeesRoute from "./routes/events/attendees/list/route";
import addAttendeeRoute from "./routes/events/attendees/add/route";
import addManyAttendeesRoute from "./routes/events/attendees/add-many/route";
import checkInAttendeeRoute from "./routes/events/attendees/check-in/route";
import checkInAllAttendeesRoute from "./routes/events/attendees/check-in-all/route";
import removeDuplicatesRoute from "./routes/events/attendees/remove-duplicates/route";
import getAttendeeByCodeRoute from "./routes/events/attendees/get-by-code/route";

import listPrizesRoute from "./routes/events/prizes/list/route";
import addPrizeRoute from "./routes/events/prizes/add/route";
import deletePrizeRoute from "./routes/events/prizes/delete/route";

import listRaffleWinnersRoute from "./routes/events/raffle/list-winners/route";
import addRaffleWinnerRoute from "./routes/events/raffle/add-winner/route";
import deleteRaffleWinnerRoute from "./routes/events/raffle/delete-winner/route";
import deleteAllRaffleWinnersRoute from "./routes/events/raffle/delete-all-winners/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    login: loginRoute,
    register: registerRoute,
    me: meRoute,
    createTestUser: createTestUserRoute,
  }),
  events: createTRPCRouter({
    list: listEventsRoute,
    get: getEventRoute,
    create: createEventRoute,
    update: updateEventRoute,
    delete: deleteEventRoute,
    attendees: createTRPCRouter({
      list: listAttendeesRoute,
      add: addAttendeeRoute,
      addMany: addManyAttendeesRoute,
      checkIn: checkInAttendeeRoute,
      checkInAll: checkInAllAttendeesRoute,
      removeDuplicates: removeDuplicatesRoute,
      getByCode: getAttendeeByCodeRoute,
    }),
    prizes: createTRPCRouter({
      list: listPrizesRoute,
      add: addPrizeRoute,
      delete: deletePrizeRoute,
    }),
    raffle: createTRPCRouter({
      listWinners: listRaffleWinnersRoute,
      addWinner: addRaffleWinnerRoute,
      deleteWinner: deleteRaffleWinnerRoute,
      deleteAllWinners: deleteAllRaffleWinnersRoute,
    }),
  }),
});

export type AppRouter = typeof appRouter;
