import  { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const postgreSql = new pg.Pool({ user: "postgres" });

const app = new Hono();
app.get("/", async (c) => {
  return c.text("Hello SOMEBODY");
});
app.get("/arbeidskrav/api/brannstasjoner", async (c) => {
  const result = await postgreSql.query(
    `SELECT 
            objid, 
            objtype, 
            brannstasjon.brannstasjon as brannstasjon, 
            st_transform(posisjon, 4326)::json as geometry, 
            brannvesen, 
            stasjonstype, 
            kasernert 
        FROM brannstasjoner_67df53337aad4d96b2746324048c4498.brannstasjon
    `,
  );
  return c.json({
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84",
      },
    },
    features: result.rows.map(
      ({ geometry: { coordinates }, ...properties }) => ({
        type: "Feature",
        properties,
        geometry: {
          type: "Point",
          coordinates,
        },
      }),
    ),
  });
});
serve(app);
