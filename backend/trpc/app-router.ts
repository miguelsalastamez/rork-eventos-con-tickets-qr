import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import loginRoute from "./routes/auth/login/route";
import registerRoute from "./routes/auth/register/route";
import meRoute from "./routes/auth/me/route";
import createTestUserRoute from "./routes/auth/create-test-user/route";

import { createEventRoute } from "./routes/events/create/route";
import { listEventsRoute } from "./routes/events/list/route";
import { getEventRoute } from "./routes/events/get/route";
import { updateEventRoute } from "./routes/events/update/route";
import { deleteEventRoute } from "./routes/events/delete/route";

import { createAttendeeRoute } from "./routes/attendees/create/route";
import { createMultipleAttendeesRoute } from "./routes/attendees/create-multiple/route";
import { listAttendeesRoute } from "./routes/attendees/list/route";
import { getAttendeeByTicketRoute } from "./routes/attendees/get-by-ticket/route";
import { checkInAttendeeRoute } from "./routes/attendees/check-in/route";
import { toggleCheckInRoute } from "./routes/attendees/toggle-check-in/route";
import { checkInAllRoute } from "./routes/attendees/check-in-all/route";
import { removeDuplicatesRoute } from "./routes/attendees/remove-duplicates/route";

import { createPrizeRoute } from "./routes/prizes/create/route";
import { createMultiplePrizesRoute } from "./routes/prizes/create-multiple/route";
import { listPrizesRoute } from "./routes/prizes/list/route";
import { deletePrizeRoute } from "./routes/prizes/delete/route";

import { createWinnerRoute } from "./routes/winners/create/route";
import { createMultipleWinnersRoute } from "./routes/winners/create-multiple/route";
import { listWinnersRoute } from "./routes/winners/list/route";
import { deleteWinnerRoute } from "./routes/winners/delete/route";
import { deleteAllWinnersRoute } from "./routes/winners/delete-all/route";

import { createTicketRoute } from "./routes/tickets/create/route";
import { updateTicketRoute } from "./routes/tickets/update/route";
import { deleteTicketRoute } from "./routes/tickets/delete/route";
import { listTicketsRoute } from "./routes/tickets/list/route";

import { createCapacityPoolRoute } from "./routes/capacity-pools/create/route";
import { listCapacityPoolsRoute } from "./routes/capacity-pools/list/route";
import { updateCapacityPoolRoute } from "./routes/capacity-pools/update/route";

import { createPurchaseRoute } from "./routes/purchases/create/route";
import { updatePurchaseRoute } from "./routes/purchases/update/route";
import { listPurchasesRoute } from "./routes/purchases/list/route";

import { sendMessageRoute } from "./routes/messages/send/route";
import { listMessagesRoute } from "./routes/messages/list/route";

import { createOrganizationRoute } from "./routes/organizations/create/route";
import { listOrganizationsRoute } from "./routes/organizations/list/route";
import { updateOrganizationRoute } from "./routes/organizations/update/route";
import { deleteOrganizationRoute } from "./routes/organizations/delete/route";

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
    create: createEventRoute,
    list: listEventsRoute,
    get: getEventRoute,
    update: updateEventRoute,
    delete: deleteEventRoute,
  }),
  attendees: createTRPCRouter({
    create: createAttendeeRoute,
    createMultiple: createMultipleAttendeesRoute,
    list: listAttendeesRoute,
    getByTicket: getAttendeeByTicketRoute,
    checkIn: checkInAttendeeRoute,
    toggleCheckIn: toggleCheckInRoute,
    checkInAll: checkInAllRoute,
    removeDuplicates: removeDuplicatesRoute,
  }),
  prizes: createTRPCRouter({
    create: createPrizeRoute,
    createMultiple: createMultiplePrizesRoute,
    list: listPrizesRoute,
    delete: deletePrizeRoute,
  }),
  winners: createTRPCRouter({
    create: createWinnerRoute,
    createMultiple: createMultipleWinnersRoute,
    list: listWinnersRoute,
    delete: deleteWinnerRoute,
    deleteAll: deleteAllWinnersRoute,
  }),
  tickets: createTRPCRouter({
    create: createTicketRoute,
    update: updateTicketRoute,
    delete: deleteTicketRoute,
    list: listTicketsRoute,
  }),
  capacityPools: createTRPCRouter({
    create: createCapacityPoolRoute,
    list: listCapacityPoolsRoute,
    update: updateCapacityPoolRoute,
  }),
  purchases: createTRPCRouter({
    create: createPurchaseRoute,
    update: updatePurchaseRoute,
    list: listPurchasesRoute,
  }),
  messages: createTRPCRouter({
    send: sendMessageRoute,
    list: listMessagesRoute,
  }),
  organizations: createTRPCRouter({
    create: createOrganizationRoute,
    list: listOrganizationsRoute,
    update: updateOrganizationRoute,
    delete: deleteOrganizationRoute,
  }),
});

export type AppRouter = typeof appRouter;
