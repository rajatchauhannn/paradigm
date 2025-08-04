[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [10g][34] » Here

[][35]

# Oracle Data Pump (expdp, impdp) in Oracle Database 10g, 11g, 12c, 18c, 19c, 21c, 23ai

Oracle Data Pump is a newer, faster and more flexible alternative to the "exp" and "imp" utilities used in previous Oracle versions. In addition to basic import and export functionality data pump provides a PL/SQL API and support for external tables.

This article was originally written against Oracle 10g, but the information is still relevant up to and including the latest versions of Oracle. New features are broken out into separate articles, but the help section at the bottom is up to date with the latest versions.

- [Getting Started][36]
- [Table Exports/Imports][37]
- [Schema Exports/Imports][38]
- [Database Exports/Imports][39]
- [INCLUDE and EXCLUDE][40]
- [CONTENT and QUERY][41]
- [Network Exports/Imports (NETWORK_LINK)][42]
- [Flashback Exports][43]
- [Miscellaneous Information][44]
- [Data Pump API][45]
- [External Tables (Unloading/Loading Data Using External Tables)][46]
- [Secure External Password Store][47]
- [Roles][48]
- [Interactive Command Mode][49]
- [Help][50]
  - [expdp][51]
  - [impdp][52]
- [Time Zone File Version][53]

Related articles.

- [Data Pump (expdp, impdp) : All Articles][54]
- Data Pump Quick Links : [10g][55], [11g][56], [12cR1][57], [12cR2][58], [18c][59], [19c][60], [21c][61], [Transportable Tablespaces][62]
- [SQL Developer 3.1 Data Pump Wizards (expdp, impdp)][63]
- [Oracle Cloud : Autonomous Data Warehouse (ADW) - Import Data from an Object Store (impdp)][64]

[][65]

## Getting Started

For the examples to work we must first unlock the SCOTT account and create a directory object it can access. The directory object is only a pointer to a physical directory, creating it does not actually create the physical directory on the file system of the database server.

CONN / AS SYSDBA
ALTER USER scott IDENTIFIED BY tiger ACCOUNT UNLOCK;

CREATE OR REPLACE DIRECTORY test_dir AS '/u01/app/oracle/oradata/';
GRANT READ, WRITE ON DIRECTORY test_dir TO scott;

Existing directories can be queried using the `ALL_DIRECTORIES` view.

Data Pump is a server-based technology, so it typically deals with directory objects pointing to physical directories on the database server. It does not write to the local file system on your client PC.

[][66]

## Table Exports/Imports

The `TABLES` parameter is used to specify the tables that are to be exported. The following is an example of the table export and import syntax.

expdp scott/tiger@db10g tables=EMP,DEPT directory=TEST_DIR dumpfile=EMP_DEPT.dmp logfile=expdpEMP_DEPT.log

impdp scott/tiger@db10g tables=EMP,DEPT directory=TEST_DIR dumpfile=EMP_DEPT.dmp logfile=impdpEMP_DEPT.log

For example output files see [expdpEMP_DEPT.log][67] and [impdpEMP_DEPT.log][68].

The `TABLE_EXISTS_ACTION=APPEND` parameter allows data to be imported into existing tables.

[][69]

## Schema Exports/Imports

The `OWNER` parameter of exp has been replaced by the `SCHEMAS` parameter which is used to specify the schemas to be exported. The following is an example of the schema export and import syntax.

expdp scott/tiger@db10g schemas=SCOTT directory=TEST_DIR dumpfile=SCOTT.dmp logfile=expdpSCOTT.log

impdp scott/tiger@db10g schemas=SCOTT directory=TEST_DIR dumpfile=SCOTT.dmp logfile=impdpSCOTT.log

For example output files see [expdpSCOTT.log][70] and [impdpSCOTT.log][71].

[][72]

## Database Exports/Imports

The `FULL` parameter indicates that a complete database export is required. The following is an example of the full database export and import syntax.

expdp system/password@db10g full=Y directory=TEST_DIR dumpfile=DB10G.dmp logfile=expdpDB10G.log

impdp system/password@db10g full=Y directory=TEST_DIR dumpfile=DB10G.dmp logfile=impdpDB10G.log

For an example output file see [expdpDB10G.log][73].

That database user performing the export will need `DATAPUMP_EXP_FULL_DATABASE` role, and the user performing the import will need the `DATAPUMP_IMP_FULL_DATABASE` role.

[][74]

## INCLUDE and EXCLUDE

The `INCLUDE` and `EXCLUDE` parameters can be used to limit the export/import to specific objects. When the `INCLUDE` parameter is used, only those objects specified by it will be included in the export/import. When the `EXCLUDE` parameter is used, all objects except those specified by it will be included in the export/import. The two parameters are mutually exclusive, so use the parameter that requires the least entries to give you the result you require. The basic syntax for both parameters is the same.

INCLUDE=object_type\[:name_clause\] \[, ...\]
EXCLUDE=object_type\[:name_clause\] \[, ...\]

The following code shows how they can be used as command line parameters.

expdp scott/tiger@db10g schemas=SCOTT include=TABLE:"IN ('EMP', 'DEPT')" directory=TEST_DIR dumpfile=SCOTT.dmp logfile=expdpSCOTT.log

expdp scott/tiger@db10g schemas=SCOTT exclude=TABLE:"= 'BONUS'" directory=TEST_DIR dumpfile=SCOTT.dmp logfile=expdpSCOTT.log

If the parameter is used from the command line, depending on your OS, the special characters in the clause may need to be escaped, as follows. Because of this, it is easier to use a parameter file.

include=TABLE:\\"IN (\\'EMP\\', \\'DEPT\\')\\"

A single import/export can include multiple references to the parameters, so to export tables, views and some packages we could use either of the following approaches.

INCLUDE=TABLE,VIEW,PACKAGE:"LIKE '%API'"

or

INCLUDE=TABLE
INCLUDE=VIEW
INCLUDE=PACKAGE:"LIKE '%API'"

Multiple objects can be targeted in once statement using the `LIKE` and `IN` operators.

EXCLUDE=SCHEMA:"LIKE 'SYS%'"

EXCLUDE=SCHEMA:"IN ('OUTLN','SYSTEM','SYSMAN','FLOWS_FILES','APEX_030200','APEX_PUBLIC_USER','ANONYMOUS')"

The valid object type paths that can be included or excluded can be displayed using the `DATABASE_EXPORT_OBJECTS`, `SCHEMA_EXPORT_OBJECTS`, and `TABLE_EXPORT_OBJECTS` views.

[][75]

## CONTENT and QUERY

The `CONTENT` parameter allows you to alter the contents of the export. The following command uses the `METADATA_ONLY` parameter value to export the contents of the schema without the data.

expdp system/password@db10g schemas=SCOTT directory=TEST_DIR dumpfile=scott_meta.dmp logfile=expdp.log content=METADATA_ONLY

To capture the data without the metadata use the `DATA_ONLY` parameter value.

expdp system/password@db10g schemas=SCOTT directory=TEST_DIR dumpfile=scott_data.dmp logfile=expdp.log content=DATA_ONLY

The `QUERY` parameter allows you to alter the rows exported from one or more tables. The following example does a full database export, but doesn't include the data for the EMP and DEPT tables.

expdp system/password@db10g full=Y directory=TEST_DIR dumpfile=full.dmp logfile=expdp_full.log query='SCOTT.EMP:"WHERE deptno=0",SCOTT.DEPT:"WHERE deptno=0"'

The way you handle quotes on the command line will vary depending on what you are trying to achieve. Here are some examples that work for single tables and multiple tables directly from the command line.

\# Single Table. Multiple quoting methods possible.
expdp scott/tiger@pdb1 schemas=scott directory=TEST_DIR dumpfile=scott1.dmp logfile=scott1.log query=SCOTT.EMP:'"WHERE deptno=10"'
expdp scott/tiger@pdb1 schemas=scott directory=TEST_DIR dumpfile=scott2.dmp logfile=scott2.log query=SCOTT.EMP:\\"WHERE deptno=10\\"
expdp scott/tiger@pdb1 schemas=scott directory=TEST_DIR dumpfile=scott3.dmp logfile=scott3.log query='SCOTT.EMP:"WHERE deptno=10"'

# Multiple WHERE clause on each table.

expdp scott/tiger@pdb1 schemas=scott directory=TEST_DIR dumpfile=scott4.dmp logfile=scott4.log query='SCOTT.EMP:"WHERE deptno=10",SCOTT.DEPT:"WHERE deptno=20"'

[][76]

## Network Exports/Imports (NETWORK_LINK)

The `NETWORK_LINK` parameter identifies a database link to be used as the source for a network export/import. The following database link will be used to demonstrate its use.

CONN / AS SYSDBA
GRANT CREATE DATABASE LINK TO test;

CONN test/test
CREATE DATABASE LINK remote_scott CONNECT TO scott IDENTIFIED BY tiger USING 'DEV';

In the case of exports, the `NETWORK_LINK` parameter identifies the database link pointing to the source server. The objects are exported from the source server in the normal manner, but written to a directory object on the local server, rather than one on the source server. Both the local and remote users require the `EXP_FULL_DATABASE` role granted to them.

expdp test/test@db10g tables=SCOTT.EMP network_link=REMOTE_SCOTT directory=TEST_DIR dumpfile=EMP.dmp logfile=expdpEMP.log

For imports, the `NETWORK_LINK` parameter also identifies the database link pointing to the source server. The difference here is the objects are imported directly from the source into the local server without being written to a dump file. Although there is no need for a `DUMPFILE` parameter, a directory object is still required for the logs associated with the operation. Both the local and remote users require the `IMP_FULL_DATABASE` role granted to them.

impdp test/test@db10g tables=SCOTT.EMP network_link=REMOTE_SCOTT directory=TEST_DIR logfile=impdpSCOTT.log remap_schema=SCOTT:TEST

[][77]

## Flashback Exports

The `exp` utility used the `CONSISTENT=Y` parameter to indicate the export should be consistent to a point in time. By default the `expdp` utility exports are only consistent on a per table basis. If you want all tables in the export to be consistent to the same point in time, you need to use the `FLASHBACK_SCN` or `FLASHBACK_TIME` parameter.

The `FLASHBACK_TIME` parameter value is converted to the approximate SCN for the specified time.

expdp ..... flashback_time=systimestamp

# In parameter file.

flashback_time="to_timestamp('09-05-2011 09:00:00', 'DD-MM-YYYY HH24:MI:SS')"

# Escaped on command line.

expdp ..... flashback_time=\\"to_timestamp\\(\\'09-05-2011 09:00:00\\', \\'DD-MM-YYYY HH24:MI:SS\\'\\)\\"

Not surprisingly, you can make exports consistent to an earlier point in time by specifying an earlier time or SCN, provided you have enough UNDO space to keep a read consistent view of the data during the export operation.

If you prefer to use the SCN, you can retrieve the current SCN using one of the following queries.

SELECT current_scn FROM v$database;
SELECT DBMS_FLASHBACK.get_system_change_number FROM dual;
SELECT TIMESTAMP_TO_SCN(SYSTIMESTAMP) FROM dual;

That SCN is then used with the `FLASHBACK_SCN` parameter.

expdp ..... flashback_scn=5474280

The following queries may prove useful for converting between timestamps and SCNs.

SELECT TIMESTAMP_TO_SCN(SYSTIMESTAMP) FROM dual;
SELECT SCN_TO_TIMESTAMP(5474751) FROM dual;

In 11.2, the introduction of legacy mode means that you can use the `CONSISTENT=Y` parameter with the `expdp` utility if you wish.

[][78]

## Miscellaneous Information

Unlike the original exp and imp utilities all data pump ".dmp" and ".log" files are created on the Oracle server, not the client machine.

Data pump performance can be improved by using the `PARALLEL` parameter. This should be used in conjunction with the "%U" wildcard in the `DUMPFILE` parameter to allow multiple dumpfiles to be created or read. The same wildcard can be used during the import to allow you to reference multiple files.

expdp scott/tiger@db10g schemas=SCOTT directory=TEST_DIR parallel=4 dumpfile=SCOTT\_%U.dmp logfile=expdpSCOTT.log

impdp scott/tiger@db10g schemas=SCOTT directory=TEST_DIR parallel=4 dumpfile=SCOTT\_%U.dmp logfile=impdpSCOTT.log

The `DBA_DATAPUMP_JOBS` view can be used to monitor the current jobs.

system@db10g&gt; select \* from dba_datapump_jobs;

OWNER_NAME JOB_NAME OPERATION

---

JOB_MODE STATE DEGREE ATTACHED_SESSIONS

---

SYSTEM SYS_EXPORT_FULL_01 EXPORT
FULL EXECUTING 1 1

[][79]

## Data Pump API

You can see more examples of this [here][80].

Along with the data pump utilities Oracle provide an PL/SQL API. The following is an example of how this API can be used to perform a schema export.

DECLARE
l_dp_handle NUMBER;
BEGIN
-- Open an schema export job.
l_dp_handle := DBMS_DATAPUMP.open(
operation =&gt; 'EXPORT',
job_mode =&gt; 'SCHEMA',
remote_link =&gt; NULL,
job_name =&gt; 'SCOTT_EXPORT',
version =&gt; 'LATEST');

-- Specify the dump file name and directory object name.
DBMS_DATAPUMP.add_file(
handle =&gt; l_dp_handle,
filename =&gt; 'SCOTT.dmp',
directory =&gt; 'TEST_DIR');

-- Specify the log file name and directory object name.
DBMS_DATAPUMP.add_file(
handle =&gt; l_dp_handle,
filename =&gt; 'expdpSCOTT.log',
directory =&gt; 'TEST_DIR',
filetype =&gt; DBMS_DATAPUMP.KU$\_FILE_TYPE_LOG_FILE);

-- Specify the schema to be exported.
DBMS_DATAPUMP.metadata_filter(
handle =&gt; l_dp_handle,
name =&gt; 'SCHEMA_EXPR',
value =&gt; '= ''SCOTT''');

DBMS_DATAPUMP.start_job(l_dp_handle);

DBMS_DATAPUMP.detach(l_dp_handle);
END;
/

Once the job has started the status can be checked using.

system@db10g&gt; select \* from dba_datapump_jobs;

The following is an example of how this API can be used to perform a schema import with a schema remap operation.

DECLARE
l_dp_handle NUMBER;
BEGIN
-- Open an schema import job.
l_dp_handle := DBMS_DATAPUMP.open(
operation =&gt; 'IMPORT',
job_mode =&gt; 'SCHEMA',
remote_link =&gt; NULL,
job_name =&gt; 'SCOTT_IMPORT',
version =&gt; 'LATEST');

-- Specify the dump file name and directory object name.
DBMS_DATAPUMP.add_file(
handle =&gt; l_dp_handle,
filename =&gt; 'SCOTT.dmp',
directory =&gt; 'TEST_DIR');

-- Specify the log file name and directory object name.
DBMS_DATAPUMP.add_file(
handle =&gt; l_dp_handle,
filename =&gt; 'impdpSCOTT.log',
directory =&gt; 'TEST_DIR',
filetype =&gt; DBMS_DATAPUMP.KU$\_FILE_TYPE_LOG_FILE);

-- Perform a REMAP_SCHEMA from SCOTT to SCOTT2.
DBMS_DATAPUMP.metadata_remap(
handle =&gt; l_dp_handle,
name =&gt; 'REMAP_SCHEMA',
old_value =&gt; 'SCOTT',
value =&gt; 'SCOTT2');

DBMS_DATAPUMP.start_job(l_dp_handle);

DBMS_DATAPUMP.detach(l_dp_handle);
END;
/

[][81]

## External Tables (Unloading/Loading Data Using External Tables)

Oracle have incorporated support for data pump technology into external tables. The `ORACLE_DATAPUMP` access driver can be used to unload data to data pump export files and subsequently reload it. The unload of data occurs when the external table is created using the "AS" clause.

CREATE TABLE emp_xt
ORGANIZATION EXTERNAL
(
TYPE ORACLE_DATAPUMP
DEFAULT DIRECTORY test_dir
LOCATION ('emp_xt.dmp')
)
AS SELECT \* FROM emp;

The data can then be queried using the following.

SELECT \* FROM emp_xt;

The syntax to create the external table pointing to an existing file is similar, but without the "AS" clause. In this case we will do it the same schema, but this could be in a different schema in the same instance, or in an entirely different instance.

DROP TABLE emp_xt;

CREATE TABLE emp_xt (
EMPNO NUMBER(4),
ENAME VARCHAR2(10),
JOB VARCHAR2(9),
MGR NUMBER(4),
HIREDATE DATE,
SAL NUMBER(7,2),
COMM NUMBER(7,2),
DEPTNO NUMBER(2))
ORGANIZATION EXTERNAL (
TYPE ORACLE_DATAPUMP
DEFAULT DIRECTORY test_dir
LOCATION ('emp_xt.dmp')
);

SELECT \* FROM emp_xt;

Creating an external table using the `ORACLE_DATAPUMP` access driver is restricted to dump files created by the external table unload.

[][82]

## Secure External Password Store

You can also use the [secure external password store][83] to provide credentials for data pump.

$ expdp /@db10g_test tables=EMP,DEPT directory=TEST_DIR dumpfile=EMP_DEPT.dmp logfile=expdpEMP_DEPT.log

[][84]

## Roles

That database user performing the export and import operations will need the appropriate level of privilege to complete the actions. For example, if the user can't create a table in the schema, it will not be able to import a table into a schema.

Some of operations, including those at database level will need the `DATAPUMP_EXP_FULL_DATABASE` and/or `DATAPUMP_IMP_FULL_DATABASE` roles. These are very powerful, so don't grant them without careful consideration.

[][85]

## Interactive Command Mode

All data pump actions are performed by multiple jobs (`DBMS_SCHEDULER` not `DBMS_JOB` jobs). These jobs are controlled by a master control process which uses Advanced Queuing. At runtime an advanced queue table, named after the job name, is created and used by the master control process. The table is dropped on completion of the data pump job. The job and the advanced queue can be named using the `JOB_NAME` parameter. Cancelling the client process does not stop the associated data pump job. Issuing "CTRL+C" on the client during a job stops the client output and puts you into interactive command mode. You can read more about this in more detail [here][86]. Typing "status" at this prompt allows you to monitor the current job.

Export&gt; status

Job: SYS_EXPORT_FULL_01
Operation: EXPORT
Mode: FULL
State: EXECUTING
Bytes Processed: 0
Current Parallelism: 1
Job Error Count: 0
Dump File: D:\\TEMP\\DB10G.DMP
bytes written: 4,096

Worker 1 Status:
State: EXECUTING
Object Schema: SYSMAN
Object Name: MGMT_CONTAINER_CRED_ARRAY
Object Type: DATABASE_EXPORT/SCHEMA/TYPE/TYPE_SPEC
Completed Objects: 261
Total Objects: 261

To switch back to the regular client, using the command "continue_client".

[][87]

## Help

The `HELP=Y` option displays the available parameters. The following output comes from 18c, but is edited to include the database version when the parameter was introduced.

[][88]

### expdp

$ expdp help=y

Export: Release 18.0.0.0.0 - Production on Mon Jan 28 08:31:55 2019
Version 18.3.0.0.0

Copyright (c) 1982, 2018, Oracle and/or its affiliates. All rights reserved.

The Data Pump export utility provides a mechanism for transferring data objects
between Oracle databases. The utility is invoked with the following command:

Example: expdp scott/tiger DIRECTORY=dmpdir DUMPFILE=scott.dmp

You can control how Export runs by entering the 'expdp' command followed
by various parameters. To specify parameters, you use keywords:

Format: expdp KEYWORD=value or KEYWORD=(value1,value2,...,valueN)
Example: expdp scott/tiger DUMPFILE=scott.dmp DIRECTORY=dmpdir SCHEMAS=scott
or TABLES=(T1:P1,T1:P2), if T1 is partitioned table

USERID must be the first parameter on the command line.

---

The available keywords and their descriptions follow. Default values are listed within square brackets.

ABORT_STEP (12.1)
Stop the job after it is initialized or at the indicated object.
Valid values are -1 or N where N is zero or greater.
N corresponds to the object's process order number in the master table.

ACCESS_METHOD (12.1)
Instructs Export to use a particular method to unload data.
Valid keyword values are: \[AUTOMATIC\], DIRECT_PATH and EXTERNAL_TABLE.

ATTACH (10.1)
Attach to an existing job.
For example, ATTACH=job_name.

CLUSTER (11.2)
Utilize cluster resources and distribute workers across the Oracle RAC \[YES\].

COMPRESSION (10.2)
Reduce the size of a dump file.
Valid keyword values are: ALL, DATA_ONLY, \[METADATA_ONLY\] and NONE.

COMPRESSION_ALGORITHM (12.1)
Specify the compression algorithm that should be used.
Valid keyword values are: \[BASIC\], LOW, MEDIUM and HIGH.

CONTENT (10.1)
Specifies data to unload.
Valid keyword values are: \[ALL\], DATA_ONLY and METADATA_ONLY.

DATA_OPTIONS (11.1)
Data layer option flags.
Valid keyword values are: GROUP_PARTITION_TABLE_DATA, VERIFY_STREAM_FORMAT and XML_CLOBS.

DIRECTORY (12.2)
Directory object to be used for dump and log files.

DUMPFILE (10.1)
Specify list of destination dump file names \[expdat.dmp\].
For example, DUMPFILE=scott1.dmp, scott2.dmp, dmpdir:scott3.dmp.

ENCRYPTION (11.1)
Encrypt part or all of a dump file.
Valid keyword values are: ALL, DATA_ONLY, ENCRYPTED_COLUMNS_ONLY, METADATA_ONLY and NONE.

ENCRYPTION_ALGORITHM (11.1)
Specify how encryption should be done.
Valid keyword values are: \[AES128\], AES192 and AES256.

ENCRYPTION_MODE (11.1)
Method of generating encryption key.
Valid keyword values are: DUAL, PASSWORD and \[TRANSPARENT\].

ENCRYPTION_PASSWORD (10.2)
Password key for creating encrypted data within a dump file.

ENCRYPTION_PWD_PROMPT (12.1)
Specifies whether to prompt for the encryption password \[NO\].
Terminal echo will be suppressed while standard input is read.

ESTIMATE (10.1)
Calculate job estimates.
Valid keyword values are: \[BLOCKS\] and STATISTICS.

ESTIMATE_ONLY (10.1)
Calculate job estimates without performing the export \[NO\].

EXCLUDE (10.1)
Exclude specific object types.
For example, EXCLUDE=SCHEMA:"='HR'".

FILESIZE (10.1)
Specify the size of each dump file in units of bytes.

FLASHBACK_SCN (10.1)
SCN used to reset session snapshot.

FLASHBACK_TIME (10.1)
Time used to find the closest corresponding SCN value.

FULL (10.1)
Export entire database \[NO\].

HELP (10.1)
Display Help messages \[NO\].

INCLUDE (10.1)
Include specific object types.
For example, INCLUDE=TABLE_DATA.

JOB_NAME (10.1)
Name of export job to create.

KEEP_MASTER (12.1)
Retain the master table after an export job that completes successfully \[NO\].

LOGFILE (10.1)
Specify log file name \[export.log\].

LOGTIME (12.1)
Specifies that messages displayed during export operations be timestamped.
Valid keyword values are: ALL, \[NONE\], LOGFILE and STATUS.

METRICS (12.1)
Report additional job information to the export log file \[NO\].

NETWORK_LINK (10.1)
Name of remote database link to the source system.

NOLOGFILE (10.1)
Do not write log file \[NO\].

PARALLEL (10.1)
Change the number of active workers for current job.

PARFILE (10.1)
Specify parameter file name.

QUERY (10.1)
Predicate clause used to export a subset of a table.
For example, QUERY=employees:"WHERE department_id &gt; 10".

REMAP_DATA (11.1)
Specify a data conversion function.
For example, REMAP_DATA=EMP.EMPNO:REMAPPKG.EMPNO.

REUSE_DUMPFILES (11.1)
Overwrite destination dump file if it exists \[NO\].

SAMPLE (10.2)
Percentage of data to be exported.

SCHEMAS (10.1)
List of schemas to export \[login schema\].

SERVICE_NAME (11.2)
Name of an active Service and associated resource group to constrain Oracle RAC resources.

SOURCE_EDITION (11.2)
Edition to be used for extracting metadata.

STATUS (10.1)
Frequency (secs) job status is to be monitored where
the default \[0\] will show new status when available.

TABLES (10.1)
Identifies a list of tables to export.
For example, TABLES=HR.EMPLOYEES,SH.SALES:SALES_1995.

TABLESPACES (10.1)
Identifies a list of tablespaces to export.

TRANSPORTABLE (12.1)
Specify whether transportable method can be used.
Valid keyword values are: ALWAYS and \[NEVER\].

TRANSPORT_FULL_CHECK (10.1)
Verify storage segments of all tables \[NO\].

TRANSPORT_TABLESPACES (10.1)
List of tablespaces from which metadata will be unloaded.

VERSION (10.1)
Version of objects to export.
Valid keyword values are: \[COMPATIBLE\], LATEST or any valid database version.

VIEWS_AS_TABLES (12.1)
Identifies one or more views to be exported as tables.
For example, VIEWS_AS_TABLES=HR.EMP_DETAILS_VIEW.

---

The following commands are valid while in interactive mode.
Note: abbreviations are allowed.

ADD_FILE
Add dumpfile to dumpfile set.

CONTINUE_CLIENT
Return to logging mode. Job will be restarted if idle.

EXIT_CLIENT
Quit client session and leave job running.

FILESIZE
Default filesize (bytes) for subsequent ADD_FILE commands.

HELP
Summarize interactive commands.

KILL_JOB
Detach and delete job.

PARALLEL
Change the number of active workers for current job.

REUSE_DUMPFILES
Overwrite destination dump file if it exists \[NO\].

START_JOB
Start or resume current job.
Valid keyword values are: SKIP_CURRENT.

STATUS
Frequency (secs) job status is to be monitored where
the default \[0\] will show new status when available.

STOP_JOB
Orderly shutdown of job execution and exits the client.
Valid keyword values are: IMMEDIATE.

STOP_WORKER
Stops a hung or stuck worker.

TRACE
Set trace/debug flags for the current job.

$

[][89]

### impdp

$ impdp help=y

Import: Release 18.0.0.0.0 - Production on Mon Jan 28 08:44:08 2019
Version 18.3.0.0.0

Copyright (c) 1982, 2018, Oracle and/or its affiliates. All rights reserved.

The Data Pump Import utility provides a mechanism for transferring data objects
between Oracle databases. The utility is invoked with the following command:

     Example: impdp scott/tiger DIRECTORY=dmpdir DUMPFILE=scott.dmp

You can control how Import runs by entering the 'impdp' command followed
by various parameters. To specify parameters, you use keywords:

     Format:  impdp KEYWORD=value or KEYWORD=(value1,value2,...,valueN)
     Example: impdp scott/tiger DIRECTORY=dmpdir DUMPFILE=scott.dmp

USERID must be the first parameter on the command line.

---

The available keywords and their descriptions follow. Default values are listed within square brackets.

ABORT_STEP (12.1)
Stop the job after it is initialized or at the indicated object.
Valid values are -1 or N where N is zero or greater.
N corresponds to the object's process order number in the master table.

ACCESS_METHOD (12.1)
Instructs Import to use a particular method to load data.
Valid keyword values are: \[AUTOMATIC\], CONVENTIONAL, DIRECT_PATH,
EXTERNAL_TABLE, and INSERT_AS_SELECT.

ATTACH (10.1)
Attach to an existing job.
For example, ATTACH=job_name.

CLUSTER (11.2)
Utilize cluster resources and distribute workers across the Oracle RAC \[YES\].

CONTENT (10.1)
Specifies data to load.
Valid keywords are: \[ALL\], DATA_ONLY and METADATA_ONLY.

DATA_OPTIONS (11.1)
Data layer option flags.
Valid keywords are: DISABLE_APPEND_HINT, ENABLE_NETWORK_COMPRESSION,
REJECT_ROWS_WITH_REPL_CHAR, SKIP_CONSTRAINT_ERRORS, CONTINUE_LOAD_ON_FORMAT_ERROR,
TRUST_EXISTING_TABLE_PARTITIONS and VALIDATE_TABLE_DATA.

DIRECTORY (10.1)
Directory object to be used for dump, log and SQL files.

DUMPFILE (10.1)
List of dump files to import from \[expdat.dmp\].
For example, DUMPFILE=scott1.dmp, scott2.dmp, dmpdir:scott3.dmp.

ENCRYPTION_PASSWORD (10.2)
Password key for accessing encrypted data within a dump file.
Not valid for network import jobs.

ENCRYPTION_PWD_PROMPT (12.1)
Specifies whether to prompt for the encryption password \[NO\].
Terminal echo is suppressed while standard input is read.

ESTIMATE (10.1)
Calculate network job estimates.
Valid keywords are: \[BLOCKS\] and STATISTICS.

EXCLUDE (10.1)
Exclude specific object types.
For example, EXCLUDE=SCHEMA:"='HR'".

FLASHBACK_SCN (10.1)
SCN used to reset session snapshot.

FLASHBACK_TIME (10.1)
Time used to find the closest corresponding SCN value.

FULL (10.1)
Import everything from source \[YES\].

HELP (10.1)
Display help messages \[NO\].

INCLUDE (10.1)
Include specific object types.
For example, INCLUDE=TABLE_DATA.

JOB_NAME (10.1)
Name of import job to create.

KEEP_MASTER (12.1)
Retain the master table after an import job that completes successfully \[NO\].

LOGFILE (10.1)
Log file name \[import.log\].

LOGTIME (12.1)
Specifies that messages displayed during import operations be timestamped.
Valid keyword values are: ALL, \[NONE\], LOGFILE and STATUS.

MASTER_ONLY (12.1)
Import just the master table and then stop the job \[NO\].

METRICS (12.1)
Report additional job information to the import log file \[NO\].

NETWORK_LINK (10.1)
Name of remote database link to the source system.

NOLOGFILE (10.1)
Do not write log file \[NO\].

PARALLEL (10.1)
Change the number of active workers for current job.

PARFILE (10.1)
Specify parameter file.

PARTITION_OPTIONS (11.1)
Specify how partitions should be transformed.
Valid keywords are: DEPARTITION, MERGE and \[NONE\].

QUERY (10.1)
Predicate clause used to import a subset of a table.
For example, QUERY=employees:"WHERE department_id &gt; 10".

REMAP_DATA (11.1)
Specify a data conversion function.
For example, REMAP_DATA=EMP.EMPNO:REMAPPKG.EMPNO.

REMAP_DATAFILE (10.1)
Redefine data file references in all DDL statements.

REMAP_SCHEMA (10.1)
Objects from one schema are loaded into another schema.

REMAP_TABLE (11.1)
Table names are remapped to another table.
For example, REMAP_TABLE=HR.EMPLOYEES:EMPS.

REMAP_TABLESPACE (10.1)
Tablespace objects are remapped to another tablespace.

REUSE_DATAFILES (10.1)
Tablespace will be initialized if it already exists \[NO\].

SCHEMAS (10.1)
List of schemas to import.

SERVICE_NAME (11.2)
Name of an active service and associated resource group to constrain Oracle RAC resources.

SKIP_UNUSABLE_INDEXES (10.1)
Skip indexes that were set to the Index Unusable state.

SOURCE_EDITION (11.2)
Edition to be used for extracting metadata.

SQLFILE (10.1)
Write all the SQL DDL to a specified file.

STATUS (10.1)
Frequency (secs) job status is to be monitored where
the default \[0\] will show new status when available.

STREAMS_CONFIGURATION (10.1)
Enable the loading of Streams metadata \[YES\].

TABLE_EXISTS_ACTION (10.1)
Action to take if imported object already exists.
Valid keywords are: APPEND, REPLACE, \[SKIP\] and TRUNCATE.

TABLES (10.1)
Identifies a list of tables to import.
For example, TABLES=HR.EMPLOYEES,SH.SALES:SALES_1995.

TABLESPACES (10.1)
Identifies a list of tablespaces to import.

TARGET_EDITION (11.2)
Edition to be used for loading metadata.

TRANSFORM (10.1)
Metadata transform to apply to applicable objects.
Valid keywords are: DISABLE_ARCHIVE_LOGGING, INMEMORY, INMEMORY_CLAUSE,
LOB_STORAGE, OID, PCTSPACE, SEGMENT_ATTRIBUTES, SEGMENT_CREATION,
STORAGE, and TABLE_COMPRESSION_CLAUSE.

TRANSPORTABLE (12.1)
Options for choosing transportable data movement.
Valid keywords are: ALWAYS and \[NEVER\].
Only valid in NETWORK_LINK mode import operations.

TRANSPORT_DATAFILES (10.1)
List of data files to be imported by transportable mode.

TRANSPORT_FULL_CHECK (10.1)
Verify storage segments of all tables \[NO\].
Only valid in NETWORK_LINK mode import operations.

TRANSPORT_TABLESPACES (10.1)
List of tablespaces from which metadata is loaded.
Only valid in NETWORK_LINK mode import operations.

VERSION (10.1)
Version of objects to import.
Valid keywords are: \[COMPATIBLE\], LATEST, or any valid database version.
Only valid for NETWORK_LINK and SQLFILE.

VIEWS_AS_TABLES (12.1)
Identifies one or more views to be imported as tables.
For example, VIEWS_AS_TABLES=HR.EMP_DETAILS_VIEW.
Note that in network import mode, a table name is appended
to the view name.

---

The following commands are valid while in interactive mode.
Note: abbreviations are allowed.

CONTINUE_CLIENT
Return to logging mode. Job will be restarted if idle.

EXIT_CLIENT
Quit client session and leave job running.

HELP
Summarize interactive commands.

KILL_JOB
Detach and delete job.

PARALLEL
Change the number of active workers for current job.

START_JOB
Start or resume current job.
Valid keywords are: SKIP_CURRENT.

STATUS
Frequency (secs) job status is to be monitored where
the default \[0\] will show new status when available.

STOP_JOB
Orderly shutdown of job execution and exits the client.
Valid keywords are: IMMEDIATE.

STOP_WORKER
Stops a hung or stuck worker.

TRACE
Set trace/debug flags for the current job.

$

[][90]

## Time Zone File Version

When you are transferring data between databases there are two basic things that can cause problems.

Transferring data from a higher database version to a lower version is possible by using the `VERSION` parameter on the export. For example, if I am exporting from a 19c database and I want to import into a 18c database I would do the following.

expdp my_user/my_password@db19c version=18 schemas=SCOTT directory=TEST_DIR dumpfile=SCOTT.dmp logfile=expdpSCOTT.log

impdp my_user/my_password@db18c schemas=SCOTT directory=TEST_DIR dumpfile=SCOTT.dmp logfile=impdpSCOTT.log

The second thing to consider is the time zone file version. It isn't possible to transfer data between databases if they don't have the same time zone file version. Later versions of the database seem more sensitive to this issue. The import will give the following error.

ORA-39002: invalid operation

If you have this problem, you need to make sure the two databases have the same time zone file version. The process for upgrading the time zone file version is described here.

- [Upgrade the Database Time Zone File Using the DBMS_DST Package][91]

For more information see:

- [Oracle Database Utilities 10g Release 1 (10.1)][92]
- [Oracle Database Utilities 10g Release 2 (10.2)][93]
- [Oracle Database Utilities 11g Release 1 (11.1)][94]
- [Oracle Database Utilities 11g Release 2 (11.2)][95]
- [Data Pump (expdp, impdp) : All Articles][96]
- Data Pump Quick Links : [10g][97], [11g][98], [12cR1][99], [12cR2][100], [18c][101], [19c][102], [21c][103], [Transportable Tablespaces][104]
- [SQL Developer 3.1 Data Pump Wizards (expdp, impdp)][105]
- [Oracle Cloud : Autonomous Data Warehouse (ADW) - Import Data from an Object Store (impdp)][106]

Hope this helps. Regards Tim...

[Back to the Top.][107]

Created: 2005-05-14&nbsp;&nbsp;Updated: 2024-05-16

[Contact Us][108]

[][109][][110][][111][][112][][113][][114]

[Home][115] | [Articles][116] | [Scripts][117] | [Blog][118] | [Certification][119] | [Videos][120] | [Misc][121] | [About][122]

[About Tim Hall][123] [Copyright &amp; Disclaimer][124]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#
[7]: https://oracle-base.com/articles/10g/oracle-data-pump-10g?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g&title=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g&title=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/10g
[35]: https://oracle-base.com/articles/10g/null
[36]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#GettingStarted
[37]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#TableExpImp
[38]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#SchemaExpImp
[39]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#DatabaseExpImp
[40]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#IncludeExclude
[41]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#content-and-query
[42]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#NetworkExportsImports
[43]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#Flashback
[44]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#MiscellaneousInformation
[45]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#DataPumpAPI
[46]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#ExternalTables
[47]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#secure-external-password-store
[48]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#roles
[49]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#interactive-command-mode
[50]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#Help
[51]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#expdp
[52]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#impdp
[53]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#time-zone-file-version
[54]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[55]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[56]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[57]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[58]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[59]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[60]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[61]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[62]: https://oracle-base.com/articles/misc/transportable-tablespaces
[63]: https://oracle-base.com/articles/misc/sql-developer-31-data-pump-wizards
[64]: https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store
[65]: https://oracle-base.com/articles/10g/null
[66]: https://oracle-base.com/articles/10g/null
[67]: https://oracle-base.com/articles/10g/expdpEMP_DEPT.log
[68]: https://oracle-base.com/articles/10g/impdpEMP_DEPT.log
[69]: https://oracle-base.com/articles/10g/null
[70]: https://oracle-base.com/articles/10g/expdpSCOTT.log
[71]: https://oracle-base.com/articles/10g/impdpSCOTT.log
[72]: https://oracle-base.com/articles/10g/null
[73]: https://oracle-base.com/articles/10g/expdpDB10G.log
[74]: https://oracle-base.com/articles/10g/null
[75]: https://oracle-base.com/articles/10g/null
[76]: https://oracle-base.com/articles/10g/null
[77]: https://oracle-base.com/articles/10g/null
[78]: https://oracle-base.com/articles/10g/null
[79]: https://oracle-base.com/articles/10g/null
[80]: https://oracle-base.com/articles/misc/data-pump-api
[81]: https://oracle-base.com/articles/10g/null
[82]: https://oracle-base.com/articles/10g/null
[83]: https://oracle-base.com/articles/10g/secure-external-password-store-10gr2
[84]: https://oracle-base.com/articles/10g/null
[85]: https://oracle-base.com/articles/10g/null
[86]: https://oracle-base.com/articles/10g/data-pump-interactive-command-mode
[87]: https://oracle-base.com/articles/10g/null
[88]: https://oracle-base.com/articles/10g/null
[89]: https://oracle-base.com/articles/10g/null
[90]: https://oracle-base.com/articles/10g/null
[91]: https://oracle-base.com/articles/misc/update-database-time-zone-file
[92]: http://docs.oracle.com/cd/B14117_01/server.101/b10825/toc.htm
[93]: http://docs.oracle.com/cd/B19306_01/server.102/b14215/toc.htm
[94]: http://docs.oracle.com/cd/B28359_01/server.111/b28319/toc.htm
[95]: http://docs.oracle.com/cd/E11882_01/server.112/e22490/toc.htm
[96]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[97]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[98]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[99]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[100]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[101]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[102]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[103]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[104]: https://oracle-base.com/articles/misc/transportable-tablespaces
[105]: https://oracle-base.com/articles/misc/sql-developer-31-data-pump-wizards
[106]: https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store
[107]: https://oracle-base.com/articles/10g/oracle-data-pump-10g#Top
[108]: https://oracle-base.com/misc/site-info#contactus
[109]: https://x.com/intent/post?text=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g
[110]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g&title=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE
[111]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g
[112]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g&title=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE
[113]: https://threads.net/intent/post?text=Oracle%20Data%20Pump%20(expdp%2C%20impdp)%20in%20Oracle%20Database%2010g%2C%2011g%2C%2012c%2C%2018c%2C%2019c%2C%2021c%2C%2023ai%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F10g%2Foracle-data-pump-10g
[114]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[115]: https://oracle-base.com/
[116]: https://oracle-base.com/articles/articles
[117]: https://oracle-base.com/dba/scripts
[118]: https://oracle-base.com/blog/
[119]: https://oracle-base.com/misc/ocp-certification
[120]: https://oracle-base.com/articles/misc/videos
[121]: https://oracle-base.com/misc/miscellaneous
[122]: https://oracle-base.com/misc/site-info
[123]: https://oracle-base.com/misc/site-info#biog
[124]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [11g][34] » Here

[][35]

# Data Pump (expdp, impdp) Enhancements in Oracle Database 11g Release 1

Oracle [Data Pump][36] was introduced in Oracle 10g. This article provides an overview of the main Data Pump enhancements in Oracle Database 11g Release 1, including the following.

- [COMPRESSION][37]
- [Encryption Parameters][38]
  - [ENCRYPTION and ENCRYPTION_PASSWORD][39]
  - [ENCRYPTION_ALGORITHM][40]
  - [ENCRYPTION_MODE][41]
- [TRANSPORTABLE][42]
- [PARTITION_OPTIONS][43]
- [REUSE_DUMPFILES][44]
- [REMAP_TABLE][45]
- [DATA_OPTIONS][46]
  - [SKIP_CONSTRAINT_ERRORS][47]
  - [XML_CLOBS][48]
- [REMAP_DATA][49]
- [Miscellaneous Enhancements][50]

Related articles.

- [Data Pump (expdp, impdp) : All Articles][51]
- Data Pump Quick Links : [10g][52], [11g][53], [12cR1][54], [12cR2][55], [18c][56], [19c][57], [21c][58], [Transportable Tablespaces][59]

[][60]

## COMPRESSION

The `COMPRESSION` parameter allows you to decide what, if anything, you wish to compress in your export. The syntax is shown below.

COMPRESSION={ALL | DATA_ONLY | METADATA_ONLY | NONE}

The available options are:

- `ALL`: Both metadata and data are compressed.
- `DATA_ONLY`: Only data is compressed.
- `METADATA_ONLY`: Only metadata is compressed. This is the default setting.
- `NONE`: Nothing is compressed.

Here is an example of the `COMPRESSION` parameter being used.

expdp test/test schemas=TEST directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
compression=all

The `COMPATIBLE` initialization parameter should be set to "11.0.0" or higher to use these options, except for the `METADATA_ONLY` option, which is available with a `COMPATIBLE` setting of "10.2".

Data compression requires the Advanced Compression Option option of Enterprise Edition, as described [here][61].

[][62]

## Encryption Parameters

Data pump encryption is an Enterprise Edition feature, so the parameters described below are only relevant for Enterprise Edition installations. In addition, the `COMPATIBLE` initialisation parameter must be set to "11.0.0" or higher to use these features.

[][63]

### ENCRYPTION and ENCRYPTION_PASSWORD

The use of encryption is controlled by a combination of the `ENCRYPTION` or `ENCRYPTION_PASSWORD` parameters. The syntax for the `ENCRYPTION` parameter is shown below.

ENCRYPTION = {ALL | DATA_ONLY | ENCRYPTED_COLUMNS_ONLY | METADATA_ONLY | NONE}

The available options are:

- `ALL`: Both metadata and data are encrypted.
- `DATA_ONLY`: Only data is encrypted.
- `ENCRYPTED_COLUMNS_ONLY`: Only encrypted columns are written to the dump file in an encrypted format.
- `METADATA_ONLY`: Only metadata is encrypted.
- `NONE`: Nothing is encrypted.

If neither the `ENCRYPTION` or `ENCRYPTION_PASSWORD` parameters are set, it is assumed the required level of encryption is `NONE`. If only the `ENCRYPTION_PASSWORD` parameter is specified, it is assumed the required level of encryption is `ALL`. Here is an example of these parameters being used.

expdp test/test schemas=TEST directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
encryption=all encryption_password=password

[][64]

### ENCRYPTION_ALGORITHM

The `ENCRYPTION_ALGORITHM` parameter specifies the encryption algorithm to be used during the export, with the default being "AES128". The syntax is shown below.

ENCRYPTION_ALGORITHM = { AES128 | AES192 | AES256 }

The `ENCRYPTION_ALGORITHM` parameter must be used in conjunction with the `ENCRYPTION` or `ENCRYPTION_PASSWORD` parameters, as shown below.

expdp test/test schemas=TEST directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
encryption=all encryption_password=password encryption_algorithm=AES256

[][65]

### ENCRYPTION_MODE

The `ENCRYPTION_MODE` parameter specifies the type of security used during export and import operations. The syntax is shown below.

ENCRYPTION_MODE = { DUAL | PASSWORD | TRANSPARENT }

The allowable values and their default settings are explained below:

- `DUAL`: This mode creates a dump file that can be imported using an Oracle Encryption Wallet, or the the `ENCRYPTION_PASSWORD` specified during the export operation. This is the default setting if the `ENCRYPTION_PASSWORD` parameter is set and there is an open wallet.
- `PASSWORD`: This mode creates a dump file that can only be imported using the `ENCRYPTION_PASSWORD` specified during the export operation. This is the default setting if the `ENCRYPTION_PASSWORD` parameter is set and there isn't an open wallet.
- `TRANSPARENT`: This mode creates an encrypted dump file using and open Oracle Encryption Wallet. If the `ENCRYPTION_PASSWORD` is specified while using this mode and error is produced. This is the default setting of only the `ENCRYPTION` parameter is set.

Wallet setup is described [here][66].

The `ENCRYPTION_MODE` requires either the `ENCRYPTION` or `ENCRYPTION_PASSWORD` parameter to be specified.

expdp test/test schemas=TEST directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
encryption=all encryption_password=password encryption_mode=password

[][67]

## TRANSPORTABLE

The `TRANSPORTABLE` parameter is similar to the `TRANSPORT_TABLESPACES` parameter available previously in that it only exports and imports metadata about a table, relying on you to manually transfer the relevent tablespace datafiles. The export operation lists the tablespaces that must be transfered. The syntax is shown below.

TRANSPORTABLE = {ALWAYS | NEVER}

The value `ALWAYS` turns on the transportable mode, while the default value of `NEVER` indicates this is a regular export/import.

The following restrictions apply during exports using the `TRANSPORTABLE` parameter:

- This parameter is only applicable during table-level exports.
- The user performing the operation must have the EXP_FULL_DATABASE privilege.
- Tablespaces containing the source objects must be read-only.
- The COMPATIBLE initialization parameter must be set to 11.0.0 or higher.
- The default tablespace of the user performing the export must not be the same as any of the tablespaces being transported.

Some extra restictions apply during import operations:

- The `NETWORK_LINK` parameter must be specified during the import operation. This parameter is set to a valid database link to the source schema.
- The schema performing the import must have both EXP_FULL_DATABASE and IMP_FULL_DATABASE privileges.
- The `TRANSPORT_DATAFILES` parameter is used to identify the datafiles holding the table data.

Examples of the export and import operations are shown below.

expdp system tables=TEST1.TAB1 directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
transportable=ALWAYS

impdp system tables=TEST1.TAB1 directory=TEST_DIR dumpfile=TEST.dmp logfile=impdpTEST.log
transportable=ALWAYS network_link=DB11G transport_datafiles='/u01/oradata/DB11G/test01.dbf'

[][68]

## PARTITION_OPTIONS

The `PARTITION_OPTIONS` parameter determines how partitions will be handled during export and import operations. The syntax is shown below.

PARTITION_OPTIONS={none | departition | merge}

The allowable values are:

- `NONE`: The partitions are created exactly as they were on the system the export was taken from.
- `DEPARTITION`: Each partition and sub-partition is created as a separate table, named using a combination of the table and (sub-)partition name.
- `MERGE`: Combines all partitions into a single table.

The `NONE` and `MERGE` options are not possible if the export was done using the `TRANSPORTABLE` parameter with a partition or subpartition filter. If there are any grants on objects being departitioned, an error message is generated and the objects are not loaded.

expdp test/test directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log tables=test.tab1
partition_options=merge

[][69]

## REUSE_DUMPFILES

The `REUSE_DUMPFILES` parameter can be used to prevent errors being issued if the export attempts to write to a dump file that already exists.

REUSE_DUMPFILES={Y | N}

When set to "Y", any existing dumpfiles will be overwritten. When the default values of "N" is used, an error is issued if the dump file already exists.

expdp test/test schemas=TEST directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
reuse_dumpfiles=y

[][70]

## REMAP_TABLE

This parameter allows a table to be renamed during the import operations performed using the `TRANSPORTABLE` method. It can also be used to alter the base table name used during `PARTITION_OPTIONS` imports. The syntax is shown below.

REMAP_TABLE=\[schema.\]old_tablename\[.partition\]:new_tablename

An example is shown below.

impdp test/test tables=TAB1 directory=TEST_DIR dumpfile=TEST.dmp logfile=impdpTEST.log
remap_table=TEST.TAB1:TAB2

Existing tables are not renamed, only tables created by the import.

[][71]

## DATA_OPTIONS

[][72]

### SKIP_CONSTRAINT_ERRORS

During import operations using the external table acces method, setting the `DATA_OPTIONS` parameter to `SKIP_CONSTRAINT_ERRORS` allows load operations to continue through non-deferred constraint violations, with any violations logged for future reference. Without this, the default action would be to roll back the whole operation. The syntax is shown below.

DATA_OPTIONS=SKIP_CONSTRAINT_ERRORS

An example is shown below.

impdp test/test tables=TAB1 directory=TEST_DIR dumpfile=TEST.dmp logfile=impdpTEST.log
data_options=SKIP_CONSTRAINT_ERRORS

This parameter has no impact on deferred constraints, which still cause the operation to be rolled back once a violation is detected. If the object being loaded has existing unique indexes or constraints, the `APPEND` hint will not be used, which may adversely affect performance.

[][73]

### XML_CLOBS

During an export, if XMLTYPE columns are currently stored as CLOBs, they will automatically be exported as uncompressed CLOBs. If on the other hand they are currently stored as any combination of object-relational, binary or CLOB formats, they will be exported in compressed format by default. Setting the `DATA_OPTIONS` parameter to `XML_CLOBS` specifies that all XMLTYPE columns should be exported as uncompressed CLOBs, regardless of the default action. The syntax is shown below.

DATA_OPTIONS=XML_CLOBS

An example is shown below.

expdp test/test tables=TAB1 directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
version=11.1 data_options=XML_CLOBS

Both the export and import must use the same XML schema and the job version must be set to 11.0.0 or higher.

[][74]

## REMAP_DATA

During export and import operations, the `REMAP_DATA` parameter allows you to associate a remap packaged function that will accept the column value as a parameter and return a modified version of the data. The syntax is shown below.

REMAP_DATA=\[schema.\]tablename.column_name:\[schema.\]pkg.function

This can be used to mask sensitive data during export and import operations by replacing the original data with random alternatives. The mapping is done on a column-by-column basis, as shown below.

expdp test/test tables=TAB1 directory=TEST_DIR dumpfile=TEST.dmp logfile=expdpTEST.log
remap_data:tab1.col1:remap_pkg.remap_col1
remap_data:tab1.col2:remap_pkg.remap_col2

The remapping function must return the same datatype as the source column and it must not perform a commit or rollback.

[][75]

## Miscellaneous Enhancements

Worker processes that have stopped due to certain errors will now have a one-time automatic restart. If the process stops a second time, it must be restarted manually.

For more information see:

- [Data Pump (expdp, impdp) : All Articles][76]
- Data Pump Quick Links : [10g][77], [11g][78], [12cR1][79], [12cR2][80], [18c][81], [19c][82], [21c][83], [Transportable Tablespaces][84]
- [What's New in Database Utilities?][85]

Hope this helps. Regards Tim...

[Back to the Top.][86]

Created: 2009-01-20&nbsp;&nbsp;Updated: 2019-01-27

[Contact Us][87]

[][88][][89][][90][][91][][92][][93]

[Home][94] | [Articles][95] | [Scripts][96] | [Blog][97] | [Certification][98] | [Videos][99] | [Misc][100] | [About][101]

[About Tim Hall][102] [Copyright &amp; Disclaimer][103]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#
[7]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/11g
[35]: https://oracle-base.com/articles/11g/null
[36]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[37]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#compression
[38]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#encryption_parameters
[39]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#encryption_and_encryption_password
[40]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#encryption_algorithm
[41]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#encryption_mode
[42]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#transportable
[43]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#partition_options
[44]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#reuse_dumpfiles
[45]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#remap_table
[46]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#data_options
[47]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#skip_constraint_errors
[48]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#xml_clobs
[49]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#remap_data
[50]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#miscellaneous
[51]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[52]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[53]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[54]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[55]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[56]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[57]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[58]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[59]: https://oracle-base.com/articles/misc/transportable-tablespaces
[60]: https://oracle-base.com/articles/11g/null
[61]: http://www.oracle.com/technetwork/database/storage/advanced-compression-whitepaper-130502.pdf
[62]: https://oracle-base.com/articles/11g/null
[63]: https://oracle-base.com/articles/11g/null
[64]: https://oracle-base.com/articles/11g/null
[65]: https://oracle-base.com/articles/11g/null
[66]: https://oracle-base.com/articles/11g/tablespace-encryption-11gr1#wallet_creation
[67]: https://oracle-base.com/articles/11g/null
[68]: https://oracle-base.com/articles/11g/null
[69]: https://oracle-base.com/articles/11g/null
[70]: https://oracle-base.com/articles/11g/null
[71]: https://oracle-base.com/articles/11g/null
[72]: https://oracle-base.com/articles/11g/null
[73]: https://oracle-base.com/articles/11g/null
[74]: https://oracle-base.com/articles/11g/null
[75]: https://oracle-base.com/articles/11g/null
[76]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[77]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[78]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[79]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[80]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[81]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[82]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[83]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[84]: https://oracle-base.com/articles/misc/transportable-tablespaces
[85]: http://docs.oracle.com/cd/B28359_01/server.111/b28319/whatsnew.htm
[86]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#Top
[87]: https://oracle-base.com/misc/site-info#contactus
[88]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1
[89]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE
[90]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1
[91]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE
[92]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2011g%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F11g%2Fdata-pump-enhancements-11gr1
[93]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[94]: https://oracle-base.com/
[95]: https://oracle-base.com/articles/articles
[96]: https://oracle-base.com/dba/scripts
[97]: https://oracle-base.com/blog/
[98]: https://oracle-base.com/misc/ocp-certification
[99]: https://oracle-base.com/articles/misc/videos
[100]: https://oracle-base.com/misc/miscellaneous
[101]: https://oracle-base.com/misc/site-info
[102]: https://oracle-base.com/misc/site-info#biog
[103]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [12c][34] » Here

[][35]

# Data Pump (expdp, impdp) Enhancements in Oracle Database 12c Release 1

Oracle [Data Pump][36] was introduced in Oracle 10g. This article provides an overview of the main Data Pump enhancements in Oracle Database 12c Release 1, including the following.

- [NOLOGGING Option (DISABLE_ARCHIVE_LOGGING)][37]
- [LOGTIME Parameter][38]
- [Export View as Table][39]
- [Change Table Compression at Import][40]
- [Change Table LOB Storage at Import][41]
- [Dumpfile Compression Options][42]
- [Multitenant Option Support (CDB and PDB)][43]
- [Audit Commands][44]
- [Encryption Password Enhancements][45]
- [Transportable Database][46]
- [Miscellaneous Enhancements][47]

Related articles.

- [12 Oracle 12c Data Pump Enhancements][48]
- [Data Pump LOGTIME][49]
- [Audit Data Pump Operations][50]
- [Data Pump (expdp, impdp) : All Articles][51]
- Data Pump Quick Links : [10g][52], [11g][53], [12cR1][54], [12cR2][55], [18c][56], [19c][57], [21c][58], [Transportable Tablespaces][59]
- [Upgrading to Oracle Database 12c - Transportable Database][60]

[][61]

## NOLOGGING Option (DISABLE_ARCHIVE_LOGGING)

The `TRANSFORM` parameter of `impdp` has been extended to include a `DISABLE_ARCHIVE_LOGGING` option. The default setting of "N" has no affect on logging behaviour. Using a value "Y" reduces the logging associated with tables and indexes during the import by setting their logging attribute to `NOLOGGING` before the data is imported and resetting it to `LOGGING` once the operation is complete.

TRANSFORM=DISABLE_ARCHIVE_LOGGING:Y

The effect can be limited to a specific type of object (`TABLE` or `INDEX`) by appending the object type.

TRANSFORM=DISABLE_ARCHIVE_LOGGING:Y:TABLE

TRANSFORM=DISABLE_ARCHIVE_LOGGING:Y:INDEX

An example of its use is shown below.

$ impdp system/Password1@pdb1 directory=test_dir dumpfile=emp.dmp logfile=impdp_emp.log \\
remap_schema=scott:test **transform=disable_archive_logging:y**

The `DISABLE_ARCHIVE_LOGGING` option has no effect if the database is running in FORCE LOGGING mode.

[][62]

## LOGTIME Parameter

The `LOGTIME` parameter determines if timestamps should be included in the output messages from the `expdp` and `impdp` utilities.

`LOGTIME=[NONE | STATUS | LOGFILE | ALL]`

The allowable values are explained below.

- `NONE` : The default value, which indicates that no timestamps should be included in the output, making the output look similar to that of previous versions.
- `STATUS` : Timestamps are included in output to the console, but not in the associated log file.
- `LOGFILE` : Timestamps are included in output to the log file, but not in the associated console messages.
- `ALL` : Timestamps are included in output to the log file and console.

An example of the output is shown below.

$ expdp scott/tiger@pdb1 tables=emp directory=test_dir dumpfile=emp.dmp logfile=expdp_emp.log **logtime=all**

Export: Release 12.1.0.1.0 - Production on Wed Nov 20 22:11:57 2013

Copyright (c) 1982, 2013, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 12c Enterprise Edition Release 12.1.0.1.0 - 64bit Production
With the Partitioning, Oracle Label Security, OLAP, Advanced Analytics
and Real Application Testing options
20-NOV-13 22:12:09.312: Starting "SCOTT"."SYS_EXPORT_TABLE_01": scott/\*\*\*\*\*\*\*\*@pdb1 tables=emp directory=test_dir dumpfile=emp.dmp logfile=expdp_emp.log logtime=all
20-NOV-13 22:12:13.602: Estimate in progress using BLOCKS method...
20-NOV-13 22:12:17.797: Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
20-NOV-13 22:12:18.145: Total estimation using BLOCKS method: 64 KB
20-NOV-13 22:12:30.583: Processing object type TABLE_EXPORT/TABLE/TABLE
20-NOV-13 22:12:33.649: Processing object type TABLE_EXPORT/TABLE/INDEX/INDEX
20-NOV-13 22:12:37.744: Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
20-NOV-13 22:12:38.065: Processing object type TABLE_EXPORT/TABLE/INDEX/STATISTICS/INDEX_STATISTICS
20-NOV-13 22:12:38.723: Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/REF_CONSTRAINT
20-NOV-13 22:12:41.052: Processing object type TABLE_EXPORT/TABLE/STATISTICS/TABLE_STATISTICS
20-NOV-13 22:12:41.337: Processing object type TABLE_EXPORT/TABLE/STATISTICS/MARKER
20-NOV-13 22:13:38.255: . . exported "SCOTT"."EMP" 8.75 KB 14 rows
20-NOV-13 22:13:40.483: Master table "SCOTT"."SYS_EXPORT_TABLE_01" successfully loaded/unloaded
20-NOV-13 22:13:40.507: \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
20-NOV-13 22:13:40.518: Dump file set for SCOTT.SYS_EXPORT_TABLE_01 is:
20-NOV-13 22:13:40.545: /home/oracle/emp.dmp
20-NOV-13 22:13:40.677: Job "SCOTT"."SYS_EXPORT_TABLE_01" successfully completed at Wed Nov 20 22:13:40 2013 elapsed 0 00:01:36

$

[][63]

## Export View as Table

The `VIEWS_AS_TABLES` parameter allows Data Pump to export the specified views as if they were tables. The table structure matches the view columns, with the data being the rows returned by the query supporting the views.

VIEWS_AS_TABLES=\[schema_name.\]view_name\[:table_name\], ...

To see it working, create a view.

CONN scott/tiger@pdb1

CREATE VIEW emp_v AS
SELECT \* FROM emp;

Now export the view using the `VIEWS_AS_TABLES` parameter.

$ expdp scott/tiger **views_as_tables=scott.emp_v** directory=test_dir dumpfile=emp_v.dmp logfile=expdp_emp_v.log

By default `expdp` creates a temporary table as a copy of the view, but with no data, to provide a source of the metadata for the export. Alternatively to can specify a table with the appropriate structure. This probably only makes sense if you are using this functionality in a read-only database.

The are a number of restrictions relating to this parameter, which you can read about [here][64].

[][65]

## Change Table Compression at Import

The `TABLE_COMPRESSION_CLAUSE` clause of the `TRANSFORM` parameter allows the table compression characteristics of the tables in an import to be altered on the fly.

TRANSFORM=TABLE_COMPRESSION_CLAUSE:\[NONE | compression_clause\]

The allowable values for the `TABLE_COMPRESSION_CLAUSE` include the following.

- NONE : The table compression clause is omitted, so the table takes on the compression characteristics of the tablespace.
- NOCOMPRESS : Disables table compression.
- COMPRESS : Enables basic table compression.
- ROW STORE COMPRESS BASIC : Same as COMPRESS.
- ROW STORE COMPRESS BASIC : Same as COMPRESS.
- ROW STORE COMPRESS ADVANCED : Enables advanced compression, also known as OLTP compression.
- COLUMN STORE COMPRESS FOR QUERY : Hybrid Columnar Compression (HCC) available in Exadata and ZFS storage appliances.
- COLUMN STORE COMPRESS FOR ARCHIVE : Hybrid Columnar Compression (HCC) available in Exadata and ZFS storage appliances.

Compression clauses that contain whitespace must be enclosed by single or double quotes.

An example of its use is shown below.

$ impdp system/Password1@pdb1 directory=test_dir dumpfile=emp.dmp logfile=impdp_emp.log \\
remap_schema=scott:test **transform=table_compression_clause:compress**

[][66]

## Change Table LOB Storage at Import

The `LOB_STORAGE` clause of the `TRANSFORM` parameter allows the LOB storage characteristics of table columns in a non-transportable import to be altered on the fly.

TRANSFORM=LOB_STORAGE:\[SECUREFILE | BASICFILE | DEFAULT | NO_CHANGE\]

The allowable values for the `LOB_STORAGE` clause include the following.

- SECUREFILE : The LOBS are stored as SecureFiles.
- BASICFILE : The LOBS are stored as BasicFiles.
- DEFAULT : The LOB storage is determined by the database default.
- NO_CHANGE : The LOB storage matches that of the source object.

An example of its use is shown below.

$ impdp system/Password1@pdb1 directory=test_dir dumpfile=lob_table.dmp logfile=impdp_lob_table.log \\
**transform=lob_storage:securefile**

[][67]

## Dumpfile Compression Options

As part of the Advanced Compression option, you can specify the `COMPRESSION_ALGORITHM` parameter to determine the level of compression of the export dumpfile. This is not related to table compression discussed previously.

COMPRESSION_ALGORITHM=\[BASIC | LOW | MEDIUM | HIGH\]

The meanings of the available values are described below.

- BASIC : The same compression algorithm used in previous versions. Provides good compression, without severely impacting on performance.
- LOW : For use when reduced CPU utilisation is a priority over compression ratio.
- MEDIUM : The recommended option. Similar characteristics to BASIC, but uses a different algorithm.
- HIGH : Maximum available compression, but more CPU intensive.

An example of its use is shown below.

$ expdp scott/tiger tables=emp directory=test_dir dumpfile=emp.dmp logfile=expdp_emp.log \\
**compression=all compression_algorithm=medium**

[][68]

## Multitenant Option Support (CDB and PDB)

Oracle Database 12c introduced the multitenant option, allowing multiple pluggable databases (PDBs) to reside in a single container database (CDB). For the most part, using data pump against a PDB is indistinguishable from using it against a non-CDB instance.

Exports using the `FULL` option from 11.2.0.2 or higher can be imported into a clean PDB in the same way you would expect for a regular full import.

There are some minor restrictions, which you can read about [here][69].

[][70]

## Audit Commands

Oracle 12c allows data pump jobs to be audited by creating an audit policy.

CREATE AUDIT POLICY policy_name
ACTIONS COMPONENT=DATAPUMP \[EXPORT | IMPORT | ALL\];

When this policy is applied to a user, their data pump jobs will appear in the audit trail. The following policy audits all data pump operations. The policy is applied to the SCOTT user.

CONN / AS SYSDBA
CREATE AUDIT POLICY audit_dp_all_policy ACTIONS COMPONENT=DATAPUMP ALL;
AUDIT POLICY audit_dp_all_policy BY scott;

Run the following data pump command.

$ expdp scott/tiger tables=emp directory=test_dir dumpfile=emp.dmp logfile=expdp_emp.log

Checking the audit trail shows the data pump job was audited.

\-- Flush audit information to disk.
EXEC DBMS_AUDIT_MGMT.FLUSH_UNIFIED_AUDIT_TRAIL;

SET LINESIZE 200
COLUMN event_timestamp FORMAT A30
COLUMN dp_text_parameters1 FORMAT A30
COLUMN dp_boolean_parameters1 FORMAT A30

SELECT event_timestamp,
dp_text_parameters1,
dp_boolean_parameters1
FROM unified_audit_trail
WHERE audit_type = 'Datapump';

EVENT_TIMESTAMP DP_TEXT_PARAMETERS1 DP_BOOLEAN_PARAMETERS1

---

14-DEC-13 09.47.40.098637 PM MASTER TABLE: "SCOTT"."SYS_EX MASTER_ONLY: FALSE, DATA_ONLY:
PORT_TABLE_01" , JOB_TYPE: EXP FALSE, METADATA_ONLY: FALSE,
ORT, METADATA_JOB_MODE: TABLE\_ DUMPFILE_PRESENT: TRUE, JOB_RE
EXPORT, JOB VERSION: 12.1.0.0. STARTED: FALSE
0, ACCESS METHOD: AUTOMATIC, D
ATA OPTIONS: 0, DUMPER DIRECTO
RY: NULL REMOTE LINK: NULL, T
ABLE EXISTS: NULL, PARTITION O
PTIONS: NONE

SQL&gt;

[][71]

## Encryption Password Enhancements

In previous versions, data pump encryption required the `ENCRYPTION_PASSWORD` parameter to be entered on the command line, making password snooping relatively easy.

In Oracle 12c, the `ENCRYPTION_PWD_PROMPT` parameter enables encryption without requiring the password to be entered as a command line parameter. Instead, the user is prompted for the password at runtime, with their response not echoed to the screen.

ENCRYPTION_PWD_PROMPT=\[YES | NO\]

An example of its use is shown below.

$ expdp scott/tiger tables=emp directory=test_dir dumpfile=emp.dmp logfile=expdp_emp.log \\
**encryption_pwd_prompt=yes**

Export: Release 12.1.0.1.0 - Production on Sat Dec 14 21:09:11 2013

Copyright (c) 1982, 2013, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 12c Enterprise Edition Release 12.1.0.1.0 - 64bit Production
With the Partitioning, OLAP, Advanced Analytics and Real Application Testing options

**Encryption Password:**
Starting "SCOTT"."SYS_EXPORT_TABLE_01": scott/\*\*\*\*\*\*\*\* tables=emp directory=test_dir
dumpfile=emp.dmp logfile=expdp_emp.log encryption_pwd_prompt=yes
Estimate in progress using BLOCKS method...
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
Total estimation using BLOCKS method: 64 KB
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/INDEX/INDEX
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
Processing object type TABLE_EXPORT/TABLE/INDEX/STATISTICS/INDEX_STATISTICS
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/REF_CONSTRAINT
Processing object type TABLE_EXPORT/TABLE/STATISTICS/TABLE_STATISTICS
Processing object type TABLE_EXPORT/TABLE/STATISTICS/MARKER
Processing object type TABLE_EXPORT/TABLE/POST_TABLE_ACTION
. . exported "SCOTT"."EMP" 8.765 KB 14 rows
Master table "SCOTT"."SYS_EXPORT_TABLE_01" successfully loaded/unloaded
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
Dump file set for SCOTT.SYS_EXPORT_TABLE_01 is:
/tmp/emp.dmp
Job "SCOTT"."SYS_EXPORT_TABLE_01" successfully completed at Sat Dec 14 21:09:55 2013 elapsed 0 00:00:41

$

[][72]

## Transportable Database

The `TRANSPORTABLE` option can now be combined with the `FULL` option to transport a whole database.

$ expdp system/Password1 **full=Y transportable=always** version=12 directory=TEMP_DIR \\
dumpfile=orcl.dmp logfile=expdporcl.log

This method can also be used to upgrade the database as described [here][73].

[][74]

## Miscellaneous Enhancements

- Data Pump supports [extended data types][75], provided the `VERSION` parameter is not set to a value prior to 12.1.
- LOB columns with a domain index can now take advantage of the direct path load method.

For more information see:

- [12 Oracle 12c Data Pump Enhancements][76]
- [Oracle Database Utilities 12c Release 1 (12.1)][77]
- [Utilities New Features : Oracle Data Pump Export and Import][78]
- [Data Pump LOGTIME][79]
- [Audit Data Pump Operations][80]
- [Data Pump (expdp, impdp) : All Articles][81]
- Data Pump Quick Links : [10g][82], [11g][83], [12cR1][84], [12cR2][85], [18c][86], [19c][87], [21c][88], [Transportable Tablespaces][89]
- [Upgrading to Oracle Database 12c - Transportable Database][90]

Hope this helps. Regards Tim...

[Back to the Top.][91]

Created: 2013-12-15&nbsp;&nbsp;Updated: 2022-07-16

[Contact Us][92]

[][93][][94][][95][][96][][97][][98]

[Home][99] | [Articles][100] | [Scripts][101] | [Blog][102] | [Certification][103] | [Videos][104] | [Misc][105] | [About][106]

[About Tim Hall][107] [Copyright &amp; Disclaimer][108]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#
[7]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/12c
[35]: https://oracle-base.com/articles/12c/null
[36]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[37]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#nologging-option
[38]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#logtime-parameter
[39]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#export-view-as-table
[40]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#change-table-compression-at-import
[41]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#change-table-lob-storage-at-import
[42]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#dumpfile-compression-options
[43]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#multitenant-option-support
[44]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#audit-commands
[45]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#encryption-password-enhancements
[46]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#transportable-database
[47]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#miscellaneous-enhancements
[48]: https://www.youtube.com/watch?v=8v06JdtYENc
[49]: https://www.youtube.com/watch?v=SRniTlvJfhA
[50]: https://www.youtube.com/watch?v=f6IMVIYDvys
[51]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[52]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[53]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[54]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[55]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[56]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[57]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[58]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[59]: https://oracle-base.com/articles/misc/transportable-tablespaces
[60]: https://oracle-base.com/articles/12c/upgrading-to-12c#transport-database
[61]: https://oracle-base.com/articles/12c/null
[62]: https://oracle-base.com/articles/12c/null
[63]: https://oracle-base.com/articles/12c/null
[64]: http://docs.oracle.com/database/121/SUTIL/GUID-E4E45E81-5391-43BE-B27D-B763EF79A885.htm#SUTIL3904
[65]: https://oracle-base.com/articles/12c/null
[66]: https://oracle-base.com/articles/12c/null
[67]: https://oracle-base.com/articles/12c/null
[68]: https://oracle-base.com/articles/12c/null
[69]: http://docs.oracle.com/database/121/SUTIL/GUID-49A847B1-3193-4C45-B7F3-B7F514B75C71.htm#SUTIL4335
[70]: https://oracle-base.com/articles/12c/null
[71]: https://oracle-base.com/articles/12c/null
[72]: https://oracle-base.com/articles/12c/null
[73]: https://oracle-base.com/articles/12c/upgrading-to-12c#transport-database
[74]: https://oracle-base.com/articles/12c/null
[75]: https://oracle-base.com/articles/12c/extended-data-types-12cR1
[76]: https://www.youtube.com/watch?v=8v06JdtYENc
[77]: http://docs.oracle.com/cd/E16655_01/server.121/e17639/toc.htm
[78]: http://docs.oracle.com/database/121/SUTIL/GUID-F4EE2A42-3986-4597-9088-A506173ABABF.htm#SUTIL4298
[79]: https://www.youtube.com/watch?v=SRniTlvJfhA
[80]: https://www.youtube.com/watch?v=f6IMVIYDvys
[81]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[82]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[83]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[84]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[85]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[86]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[87]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[88]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[89]: https://oracle-base.com/articles/misc/transportable-tablespaces
[90]: https://oracle-base.com/articles/12c/upgrading-to-12c#transport-database
[91]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1#Top
[92]: https://oracle-base.com/misc/site-info#contactus
[93]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1
[94]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE
[95]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1
[96]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE
[97]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%201%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr1
[98]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[99]: https://oracle-base.com/
[100]: https://oracle-base.com/articles/articles
[101]: https://oracle-base.com/dba/scripts
[102]: https://oracle-base.com/blog/
[103]: https://oracle-base.com/misc/ocp-certification
[104]: https://oracle-base.com/articles/misc/videos
[105]: https://oracle-base.com/misc/miscellaneous
[106]: https://oracle-base.com/misc/site-info
[107]: https://oracle-base.com/misc/site-info#biog
[108]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [12c][34] » Here

[][35]

# Data Pump (expdp, impdp) Enhancements in Oracle Database 12c Release 2 (12.2)

This article provides an overview of the main Data Pump enhancements in Oracle Database 12c Release 2 (12.2).

Some of these features are not listed in the `expdp -help` or `impdp -help` usage text.

- [Parallel Export/Import of Metadata][36]
- [Wildcards in TRANSPORT_DATAFILES][37]
- [New Substitution Variables for File Names][38]
- [Parameter File Contents Written to Log File][39]
- [REMAP_DIRECTORY][40]
- [DATA_OPTIONS Changes][41]
- [Miscellaneous][42]

Related articles.

- [Data Pump (expdp, impdp) : All Articles][43]
- Data Pump Quick Links : [10g][44], [11g][45], [12cR1][46], [12cR2][47], [18c][48], [19c][49], [21c][50], [Transportable Tablespaces][51]

[][52]

## Parallel Export/Import of Metadata

In previous releases the `PARALLEL` parameter was only relevant to the export/import of data, with all metadata processed serially. In Oracle 12.2 both metadata and data can be exported in parallel provided it is not a transportable tablespace operation.

The order of operations is important during an import, so the possible levels of parallelism may vary throughout the import job. If possible, the import will use parallelism up to the value of the `PARALLEL` parameter for both metadata and data import.

[][53]

## Wildcards in TRANSPORT_DATAFILES

When using the `TRANSPORT_DATAFILES` parameter, the datafile definition can now use wildcards in the file name.

- \* : Zero to many characters.
- ? : Exactly one character.

The wildcards are not allowed in directory names, just file names, and the wildcards can't match files that are not present in the transport set, or an error will be produced.

\# This
transport_datafiles=/my/path/file10.dbf,/my/path/file11.dbf,/my/path/file12.dbf

# becomes one of these alternatives.

transport_datafiles=/my/path/file\*.dbf
transport_datafiles=/my/path/file1\*.dbf
transport_datafiles=/my/path/file1?.dbf

[][54]

## New Substitution Variables for File Names

Multiple files are generated by parallel exports, so each file needs to have a unique name. This is achieved using substitution variables. In previous releases the only substitution variable available was "%U", which generated a two digit number from 01-99. Oracle 12.2 includes additional substitution variables.

The following substitution variables are only available for export operations.

- %d, %D : The current day of the month in DD format.
- %m, %M : The current month in MM format.
- %y, %Y : The current year in YYYY format.
- %t, %T : The current date in YYYYMMDD format.

The following substitution variables are available for both export and import operations.

- %U : Unchanged from previous releases. A two digit number incremented between 01-99.
- %l, %L : This starts off similar to "%U", producing a two digit number between 01-99, but it can extend up to 2147483646, so the resulting file name is not a fixed length.

The following example shows the usage of two of the new substitution variables in a parallel export. The output is edited to reduce its size.

$ expdp system/OraPasswd1@pdb1 schemas=OE directory=TEST_DIR **dumpfile=OE\_%T\_%L.dmp** logfile=expdpOE.log **parallel=4**

Export: Release 12.2.0.1.0 - Production on Wed Mar 22 16:04:32 2017

Copyright (c) 1982, 2017, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 12c Enterprise Edition Release 12.2.0.1.0 - 64bit Production
Starting "SYSTEM"."SYS_EXPORT_SCHEMA_01": system/\*\*\*\*\*\*\*\*@pdb1 schemas=OE directory=TEST_DIR dumpfile=OE\_%T\_%L.dmp logfile=expdpOE.log parallel=4
Processing object type SCHEMA_EXPORT/ROLE_GRANT
Processing object type SCHEMA_EXPORT/SYSTEM_GRANT
.
.
.
Master table "SYSTEM"."SYS_EXPORT_SCHEMA_01" successfully loaded/unloaded
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
Dump file set for SYSTEM.SYS_EXPORT_SCHEMA_01 is:
**/tmp/OE_20170322_01.dmp
/tmp/OE_20170322_02.dmp
/tmp/OE_20170322_03.dmp
/tmp/OE_20170322_04.dmp**
Job "SYSTEM"."SYS_EXPORT_SCHEMA_01" completed with 1 error(s) at Wed Mar 22 16:05:41 2017 elapsed 0 00:01:07

$

[][55]

## Parameter File Contents Written to Log File

The contents of the parameter file specified by the `PARFILE` parameter is written to the logfile, but not echoed to the screen.

Create the following parameter file and run an export using it.

cat &gt; /tmp/parfile.txt &lt;&lt;EOF
USERID=test/test@pdb1
schemas=TEST
directory=TEST_DIR
dumpfile=TEST.dmp
logfile=expdpTEST.log
EOF

expdp parfile=/tmp/parfile.txt

If we check the top of the resulting log file we can see the parameter file contents.

$ head -15 /tmp/expdpTEST.log
;;;
Export: Release 12.2.0.1.0 - Production on Mon Aug 21 19:45:00 2017

Copyright (c) 1982, 2017, Oracle and/or its affiliates. All rights reserved.
;;;
Connected to: Oracle Database 12c Enterprise Edition Release 12.2.0.1.0 - 64bit Production
**;;; \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
;;; Parfile values:
;;; parfile: logfile=expdpTEST.log
;;; parfile: dumpfile=TEST.dmp
;;; parfile: directory=TEST_DIR
;;; parfile: schemas=TEST
;;; parfile: userid=test/\*\*\*\*\*\*\*\*@pdb1
;;; \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\***
Starting "TEST"."SYS_EXPORT_SCHEMA_01": test/\*\*\*\*\*\*\*\*@pdb1 parfile=/tmp/parfile.txt
$

[][56]

## REMAP_DIRECTORY

The `REMAP_DIRECTORY` parameter is a variant of the `REMAP_DATAFILE` parameter, which allows you to remap the paths of multiple datafile references in a single shot. The `REMAP_DIRECTORY` and `REMAP_DATAFILE` parameters are mutually exclusive.

The basic syntax is a search and replace, with the documentation recommending the inclusion terminators and double-quotes. Since this would have to be escaped at the command line, it's easier to view the setting as it would be in a parameter file.

REMAP_DIRECTORY="'/u02/oradata/cdb1/pdb1/':'/u02/oradata/cdb3/pdb3/'"

You can see it in the context of a full parameter file below.

cat &gt; /tmp/parfile.txt &lt;&lt;EOF
USERID=system/OraPasswd1@pdb1
schemas=TEST
directory=TEST_DIR
dumpfile=TEST.dmp
logfile=impdpTEST.log
remap_directory="'/u02/oradata/cdb1/pdb1/':'/u02/oradata/cdb3/pdb3/'"
EOF

impdp parfile=/tmp/parfile.txt

This parameter is not present in the `impdp -help` usage information.

[][57]

## DATA_OPTIONS Changes

There have been a number of changes to the `DATA_OPTIONS` parameter for export and import in Oracle Database 12.2. The new settings are displayed below in bold.

\# Export
DATA_OPTIONS = \[XML_CLOBS | **GROUP_PARTITION_TABLE_DATA** | **VERIFY_STREAM_FORMAT**\]

# Import

DATA_OPTIONS = \[DISABLE_APPEND_HINT | SKIP_CONSTRAINT_ERRORS |
**ENABLE_NETWORK_COMPRESSION** | REJECT_ROWS_WITH_REPL_CHAR |
**TRUST_EXISTING_TABLE_PARTITIONS** | **VALIDATE_TABLE_DATA**\]

These settings are described in the manuals ([export][58], [import][59]), but they are briefly described below.

- `GROUP_PARTITION_TABLE_DATA` : Unloads all partitions as a single operation producing a single partition of data in the dump file. Subsequent imports will not know this was originally made up of multiple partitions.
- `VERIFY_STREAM_FORMAT` : Validates the format of the data stream before it is written to the dump file, so you are less likely to have problems with the contents of the dumpfile.
- `ENABLE_NETWORK_COMPRESSION` : Compresses data during network imports using the `ACCESS_METHOD` of `DIRECT_PATH`. There are some caveats described [here][60].
- `TRUST_EXISTING_TABLE_PARTITIONS` : Loads partition data in parallel into existing partitions on the destination database. The partitions must already be present with the correct attributes.
- `VALIDATE_TABLE_DATA` : Validates numbers and dates during imports. Writes ORA-39376 errors inclduing the column information to the log file if it finds invalid data.

You can see the new export `DATA_OPTIONS` settings in the context of a full parameter file below.

cat &gt; /tmp/parfile.txt &lt;&lt;EOF
USERID=system/OraPasswd1@pdb1
schemas=TEST
directory=TEST_DIR
dumpfile=TEST.dmp
logfile=expdpTEST.log
data_options=group_partition_table_data,verify_stream_format
EOF

expdp parfile=/tmp/parfile.txt

You can see the new import `DATA_OPTIONS` settings in the context of a full parameter file below. The compression setting is ignored as this is not a network import.

cat &gt; /tmp/parfile.txt &lt;&lt;EOF
USERID=system/OraPasswd1@pdb1
schemas=TEST
directory=TEST_DIR
dumpfile=TEST.dmp
logfile=impdpTEST.log
data_options=enable_network_compression,trust_existing_table_partitions,validate_table_data
EOF

impdp parfile=/tmp/parfile.txt

[][61]

## Miscellaneous

There are quite a few new features that don't need a demonstration or syntax example, including the following.

- Data Pump now supports [long identifiers][62] for both its own object names and those in the metadata it exports and imports.
- The [data-bound collation][63] feature was introduced on Oracle Database 12.2. Data pump includes support for data-bound collation. Collation metadata is always exported, including column, table and schema level settings. The metadata is only included in an DDL generated by an import if the `VERSION` parameter is set (implicitly or explicity) to 12.2 and the destination database supports collation.
- Network imports using the [NETWORK_LINK][64] parameter now support LONG columns. There are still a number of other restrictions associated with network imports though.
- Network imports using the [NETWORK_LINK][65] parameter can now use the [ACCESS_METHOD][66] parameter.
- Both export and import support the the new big SCN size with [FLASHBACK_SCN][67] provided they are being used against a database that supports it.
- Transportable tablespace exports support encrypted columns.

For more information see:

- [Database Utilities][68]
- [Data Pump Export (expdp)][69]
- [Data Pump import (impdp)][70]
- [Data Pump (expdp, impdp) : All Articles][71]
- Data Pump Quick Links : [10g][72], [11g][73], [12cR1][74], [12cR2][75], [18c][76], [19c][77], [21c][78], [Transportable Tablespaces][79]

Hope this helps. Regards Tim...

[Back to the Top.][80]

Created: 2017-08-21&nbsp;&nbsp;Updated: 2019-01-27

[Contact Us][81]

[][82][][83][][84][][85][][86][][87]

[Home][88] | [Articles][89] | [Scripts][90] | [Blog][91] | [Certification][92] | [Videos][93] | [Misc][94] | [About][95]

[About Tim Hall][96] [Copyright &amp; Disclaimer][97]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#
[7]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/12c
[35]: https://oracle-base.com/articles/12c/null
[36]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#parallel-export-import-of-metadata
[37]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#wildcards-in-transport-datafiles
[38]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#new-substitution-variables-for-file-names
[39]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#parameter-file-contents-written-to-log-file
[40]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#remap_directory
[41]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#data_options-changes
[42]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#miscellaneous
[43]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[44]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[45]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[46]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[47]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[48]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[49]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[50]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[51]: https://oracle-base.com/articles/misc/transportable-tablespaces
[52]: https://oracle-base.com/articles/12c/null
[53]: https://oracle-base.com/articles/12c/null
[54]: https://oracle-base.com/articles/12c/null
[55]: https://oracle-base.com/articles/12c/null
[56]: https://oracle-base.com/articles/12c/null
[57]: https://oracle-base.com/articles/12c/null
[58]: http://docs.oracle.com/database/122/SUTIL/oracle-data-pump-export-utility.htm#SUTIL839
[59]: http://docs.oracle.com/database/122/SUTIL/datapump-import-utility.htm#SUTIL906
[60]: http://docs.oracle.com/database/122/SUTIL/datapump-import-utility.htm#SUTIL906
[61]: https://oracle-base.com/articles/12c/null
[62]: https://oracle-base.com/articles/12c/long-identifiers-12cr2
[63]: https://oracle-base.com/articles/12c/column-level-collation-and-case-insensitive-database-12cr2
[64]: http://docs.oracle.com/database/122/SUTIL/datapump-import-utility.htm#GUID-0871E56B-07EB-43B3-91DA-D1F457CF6182
[65]: http://docs.oracle.com/database/122/SUTIL/datapump-import-utility.htm#GUID-0871E56B-07EB-43B3-91DA-D1F457CF6182
[66]: http://docs.oracle.com/database/122/SUTIL/datapump-import-utility.htm#SUTIL3862
[67]: http://docs.oracle.com/database/122/SUTIL/oracle-data-pump-export-utility.htm#SUTIL849
[68]: http://docs.oracle.com/database/122/SUTIL/toc.htm
[69]: http://docs.oracle.com/database/122/SUTIL/oracle-data-pump-export-utility.htm
[70]: http://docs.oracle.com/database/122/SUTIL/datapump-import-utility.htm
[71]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[72]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[73]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[74]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[75]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[76]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[77]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[78]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[79]: https://oracle-base.com/articles/misc/transportable-tablespaces
[80]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2#Top
[81]: https://oracle-base.com/misc/site-info#contactus
[82]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2
[83]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE
[84]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2
[85]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE
[86]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2012c%20Release%202%20(12.2)%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F12c%2Fdata-pump-enhancements-12cr2
[87]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[88]: https://oracle-base.com/
[89]: https://oracle-base.com/articles/articles
[90]: https://oracle-base.com/dba/scripts
[91]: https://oracle-base.com/blog/
[92]: https://oracle-base.com/misc/ocp-certification
[93]: https://oracle-base.com/articles/misc/videos
[94]: https://oracle-base.com/misc/miscellaneous
[95]: https://oracle-base.com/misc/site-info
[96]: https://oracle-base.com/misc/site-info#biog
[97]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [18c][34] » Here

[][35]

# Data Pump (expdp, impdp) Enhancements in Oracle Database 18c

This article provides an overview of the main Data Pump enhancements in Oracle Database 18c.

- [Data Pump with Encrypted Data Dictionary Data][36]
- [Export/Import the Unified Audit Trail][37]
- [CONTINUE_LOAD_ON_FORMAT_ERROR][38]

Related articles.

- [Encrypt Sensitive Credential Data in the Data Dictionary in Oracle Database 18c][39]
- [Data Pump (expdp, impdp) : All Articles][40]
- Data Pump Quick Links : [10g][41], [11g][42], [12cR1][43], [12cR2][44], [18c][45], [19c][46], [21c][47], [Transportable Tablespaces][48]

[][49]

## Data Pump with Encrypted Data Dictionary Data

From Oracle 18c onward it is possible to optionally encrypt sensitive credential data in the data dictionary, see [here][50]. If you have chosen to use this feature, the export and import utilities will not expose your passwords. When exporting data, the following type of message will be produced for any database link. A similar message will be produced during the import of the links provided the database version is 18c or higher.

ORA-39395: Warning: object &lt;database link name&gt; requires password reset after import

The export operation stores an invalid password in the dump file. On completion of an import, we must amend the password of the database link.

alter database link {database_link_name} connect to {schema_name} identified by {password};

[][51]

## Export/Import the Unified Audit Trail

From Oracle 18c onward it is possible to export and import the unified audit trails. The users performing the export and import operations require the `EXP_FULL_DATABASE` and `IMP_FULL_DATABASE` roles respectively.

First we create a directory object and grant access to the `SYSTEM` user.

conn sys/SysPassword1@//localhost:1521/pdb1 as sysdba

create or replace directory tmp_dir as '/tmp/';
grant read, write on directory tmp_dir to system;

We export using the `INCLUDE=AUDIT_TRAILS` option to pick up all the unified audit trail tables.

expdp system/SysPassword1@pdb1 \\
full=y \\
directory=tmp_dir \\
logfile=audit_trails-exp.log \\
dumpfile=audit_trails.dmp \\
version=18.02.00.02.00 \\
include=audit_trails

Since this dump file only contains the unified audit trail objects, we can use a full import to import the audit data.

impdp system/SysPassword1@pdb1 \\
full=y \\
directory=tmp_dir \\
logfile=audit_trails-imp.log \\
dumpfile=audit_trails.dmp

[][52]

## CONTINUE_LOAD_ON_FORMAT_ERROR

In previous releases, if a dump file was corrupted an import operation would fail. From Oracle 18c onward the `impdp` utility can be instructed to skip the corrupt granule and continue with the import. As expected, this will mean some data is lost, but it will allow the operation to complete.

impdp system/SysPassword1@pdb1 \\
full=y \\
directory=tmp_dir \\
logfile=imp.log \\
dumpfile=corrupt-dump-file.dmp \\
data_options=continue_load_on_format_error

For more information see:

- [Using Oracle Data Pump with Encrypted Data Dictionary Data][53]
- [Exporting and Importing the Unified Audit Trail Using Oracle Data Pump][54]
- [Continue Loading When Data Format Error is Encountered (CONTINUE_LOAD_ON_FORMAT_ERROR)][55]
- [Encrypt Sensitive Credential Data in the Data Dictionary in Oracle Database 18c][56]
- [Data Pump (expdp, impdp) : All Articles][57]
- Data Pump Quick Links : [10g][58], [11g][59], [12cR1][60], [12cR2][61], [18c][62], [19c][63], [21c][64], [Transportable Tablespaces][65]

Hope this helps. Regards Tim...

[Back to the Top.][66]

Created: 2021-12-31&nbsp;&nbsp;Updated: 2022-01-02

[Contact Us][67]

[][68][][69][][70][][71][][72][][73]

[Home][74] | [Articles][75] | [Scripts][76] | [Blog][77] | [Certification][78] | [Videos][79] | [Misc][80] | [About][81]

[About Tim Hall][82] [Copyright &amp; Disclaimer][83]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c#
[7]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/18c
[35]: https://oracle-base.com/articles/18c/null
[36]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c#encrypted-data
[37]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c#unified-audit-trail
[38]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c#format-errors
[39]: https://oracle-base.com/articles/18c/encrypt-sensitive-credential-data-in-the-data-dictionary-18c
[40]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[41]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[42]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[43]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[44]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[45]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[46]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[47]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[48]: https://oracle-base.com/articles/misc/transportable-tablespaces
[49]: https://oracle-base.com/articles/18c/null
[50]: https://oracle-base.com/articles/18c/encrypt-sensitive-credential-data-in-the-data-dictionary-18c
[51]: https://oracle-base.com/articles/18c/null
[52]: https://oracle-base.com/articles/18c/null
[53]: https://docs.oracle.com/en/database/oracle/oracle-database/18/asoag/using-transparent-data-encryption-with-other-oracle-features.html#GUID-9FC4FAEC-32A5-40E6-BBC1-3CCE0EF0BE2F
[54]: https://docs.oracle.com/en/database/oracle/oracle-database/18/dbseg/administering-the-audit-trail.html#GUID-8140CCBF-77EE-4F86-A055-B9F9AB8B4573
[55]: https://docs.oracle.com/en/database/oracle/oracle-database/18/sutil/datapump-import-utility.html
[56]: https://oracle-base.com/articles/18c/encrypt-sensitive-credential-data-in-the-data-dictionary-18c
[57]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[58]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[59]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[60]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[61]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[62]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[63]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[64]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[65]: https://oracle-base.com/articles/misc/transportable-tablespaces
[66]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c#Top
[67]: https://oracle-base.com/misc/site-info#contactus
[68]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c
[69]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE
[70]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c
[71]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE
[72]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2018c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F18c%2Fdata-pump-enhancements-18c
[73]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[74]: https://oracle-base.com/
[75]: https://oracle-base.com/articles/articles
[76]: https://oracle-base.com/dba/scripts
[77]: https://oracle-base.com/blog/
[78]: https://oracle-base.com/misc/ocp-certification
[79]: https://oracle-base.com/articles/misc/videos
[80]: https://oracle-base.com/misc/miscellaneous
[81]: https://oracle-base.com/misc/site-info
[82]: https://oracle-base.com/misc/site-info#biog
[83]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [19c][34] » Here

[][35]

# Data Pump (expdp, impdp) Enhancements in Oracle Database 19c

This article provides an overview of the main Data Pump enhancements in Oracle Database 19c.

- [Hybrid Partitioned Tables][36]
- [Exclude ENCRYPTION Clause on Import][37]
- [Wildcards for Dump File Names in Object Stores][38]
- [CREDENTIAL Parameter][39]
- [Import Table Partitions in a Single Operation][40]
- [Tablespaces Remain Read-Only During Transportable Tablespace Imports][41]
- [Prevent Inadvertent Use of Protected Roles][42]
- [Resource Limitations][43]
- [Test Mode for Transportable Tablespaces][44]

Related articles.

- [Hybrid Partitioned Tables in Oracle Database 19c][45]
- [Exclude ENCRYPTION Clause on Import in Oracle Database 19c][46]
- [Oracle Cloud : Autonomous Database (ADW or ATP) - Import Data from an Object Store (impdp)][47]
- [Oracle Cloud : Autonomous Database (ADW or ATP) - Export Data to an Object Store (expdp)][48]
- [Data Pump (expdp, impdp) : All Articles][49]
- Data Pump Quick Links : [10g][50], [11g][51], [12cR1][52], [12cR2][53], [18c][54], [19c][55], [21c][56], [Transportable Tablespaces][57]

[][58]

## Hybrid Partitioned Tables

Oracle 19c introduced Hybrid Partitioned Tables, which allow internal and external partitions to be combined into a single table. The options for external partitions include Data Pump. For more information about Hybrid Partitioned Tables see the following article.

- [Hybrid Partitioned Tables in Oracle Database 19c][59]

[][60]

## Exclude ENCRYPTION Clause on Import

The `OMIT_ENCRYPTION_CLAUSE` option has been added to the `[TRANSFORM][61]` parameter. The value of "Y" makes Data Pump supress column encryption clauses for tables. As a result columns that were encrypted in the source table will not be encrypted in the destination table. The default value is "N", making column encryption of the destination table match that of the source table. This feature is demonstrated in the following article.

- [Exclude ENCRYPTION Clause on Import in Oracle Database 19c][62]

[][63]

## Wildcards for Dump File Names in Object Stores

From 19c onward we can use wildcards in URL-based dump file names, making import from multiple files into Autonomous Databases easier. This feature is discussed in the following article.

- [Oracle Cloud : Autonomous Database (ADW or ATP) - Import Data from an Object Store (impdp)][64]

[][65]

## CREDENTIAL Parameter

From 19c onward we can use the `[CREDENTIAL][66]` parameter, rather than the `DEFAULT_CREDENTIAL` database setting, to specify the object store credentials. This functionality was backported to the 18c client. There are examples of using the `CREDENTIAL` parameter in the following articles.

- [Oracle Cloud : Autonomous Database (ADW or ATP) - Import Data from an Object Store (impdp)][67]
- [Oracle Cloud : Autonomous Database (ADW or ATP) - Export Data to an Object Store (expdp)][68]
- [Data Pump Export (expdp) to and Import (impdp) From Cloud Object Stores in Oracle Database 21c][69]

[][70]

## Import Table Partitions in a Single Operation

By default each partition of a partitioned table is imported as part of a separate operation. The `GROUP_PARTITION_TABLE_DATA` option was added to the `[DATA_OPTIONS][71]` parameter, to allow all table partitions to be imported as part of a single operation. Here is an example of the syntax.

impdp testuser1/testuser1@pdb1 \\
tables=t1 \\
directory=tmp_dir \\
logfile=t1-imp.log \\
dumpfile=t1.dmp \\
**data_options=group_partition_table_data**

[][72]

## Tablespaces Remain Read-Only During Transportable Tablespace Imports

The `[TRANSPORTABLE][73]=KEEP_READ_ONLY` option has been added to allow transportable tablespaces to be imported with their data files remaining in read-only mode. Since the files are never touched, the same files can be transported into multiple databases without problems provided they all use read-only access.

[][74]

## Prevent Inadvertent Use of Protected Roles

Oracle allows us to creat roles that require authorization. In Oracle 19c any export or import operation that requires an authorized role can only take place if the `[ENABLE_SECURE_ROLES][75]=YES` parameter is set. The default value of this parameter is `NO`.

[][76]

## Resource Limitations

The `[MAX_DATAPUMP_JOBS_PER_PDB][77]` initialization parameter was introduced in Oracle 12.2 to limit resources used by Data Pump at the PDB level. The default value for this parameter was 100 and allowable values were from 0 to 2147483647. In Oracle 19c the default value is still 100, but the allowable values are from 0 to 250, or the value `AUTO`. When `AUTO` is used, the value is set to 50% of the `SESSIONS` initialization parameter value.

The `[MAX_DATAPUMP_PARALLEL_PER_JOB][78]` parameter has been added to limit the degree of parallelism used by Data Pump for a single job. It has a default value of 50, with allowable values from 1 to 1024, or the value `AUTO`. When `AUTO` is used, the value is set to 50% of the `SESSIONS` initialization parameter value.

[][79]

## Test Mode for Transportable Tablespaces

Transportable tablespaces require the relevant tablespaces to be in read-only mode. This can make testing and timing of export operations difficult on production systems. Oracle 19c introduced a test mode, which allows us to test a transportable tablespace export without needing the tablespaces in read-only mode.

The `[TTS_CLOSURE_CHECK][80]` parameter has the following allowable values.

- `ON` - A self-containment closure check is performed.
- `OFF` - No closure check is performed.
- `FULL` - Full bidirectional closure check is performed.
- `TEST_MODE` - Tablespaces are not required to be in read-only mode.

For more information see:

- [Hybrid Partitioned Tables in Oracle Database 19c][81]
- [Exclude ENCRYPTION Clause on Import in Oracle Database 19c][82]
- [Oracle Cloud : Autonomous Database (ADW or ATP) - Import Data from an Object Store (impdp)][83]
- [Oracle Cloud : Autonomous Database (ADW or ATP) - Export Data to an Object Store (expdp)][84]
- [Data Pump (expdp, impdp) : All Articles][85]
- Data Pump Quick Links : [10g][86], [11g][87], [12cR1][88], [12cR2][89], [18c][90], [19c][91], [21c][92], [Transportable Tablespaces][93]

Hope this helps. Regards Tim...

[Back to the Top.][94]

Created: 2022-01-02&nbsp;&nbsp;Updated: 2022-01-02

[Contact Us][95]

[][96][][97][][98][][99][][100][][101]

[Home][102] | [Articles][103] | [Scripts][104] | [Blog][105] | [Certification][106] | [Videos][107] | [Misc][108] | [About][109]

[About Tim Hall][110] [Copyright &amp; Disclaimer][111]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#
[7]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/19c
[35]: https://oracle-base.com/articles/19c/null
[36]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#hybrid-partitioned-tables
[37]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#exclude-encryption
[38]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#wildcards
[39]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#credential-parameter
[40]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#partitions
[41]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#transportable-tablespace
[42]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#protected-roles
[43]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#resource-limitations
[44]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#test-mode-for-tts
[45]: https://oracle-base.com/articles/19c/hybrid-partitioned-tables-19c
[46]: https://oracle-base.com/articles/19c/exclude-encryption-clause-on-import-19c
[47]: https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3
[48]: https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp
[49]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[50]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[51]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[52]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[53]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[54]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[55]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[56]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[57]: https://oracle-base.com/articles/misc/transportable-tablespaces
[58]: https://oracle-base.com/articles/19c/null
[59]: https://oracle-base.com/articles/19c/hybrid-partitioned-tables-19c
[60]: https://oracle-base.com/articles/19c/null
[61]: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-64FB67BD-EB67-4F50-A4D2-5D34518E6BDB
[62]: https://oracle-base.com/articles/19c/exclude-encryption-clause-on-import-19c
[63]: https://oracle-base.com/articles/19c/null
[64]: https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3
[65]: https://oracle-base.com/articles/19c/null
[66]: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-B6038E22-89B1-49AF-8521-C9B03C067985
[67]: https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3
[68]: https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp
[69]: https://oracle-base.com/articles/21c/data-pump-export-import-cloud-object-store-21c
[70]: https://oracle-base.com/articles/19c/null
[71]: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-5FFA128D-B7F5-41D0-A72C-EB2CE384765D
[72]: https://oracle-base.com/articles/19c/null
[73]: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-6C68D323-988F-4A4D-9112-20EA2F53C5C2
[74]: https://oracle-base.com/articles/19c/null
[75]: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-958B6081-7609-4928-963B-47E5E6542D58
[76]: https://oracle-base.com/articles/19c/null
[77]: https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/MAX_DATAPUMP_JOBS_PER_PDB.html
[78]: https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/MAX_DATAPUMP_PARALLEL_PER_JOB.html
[79]: https://oracle-base.com/articles/19c/null
[80]: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-70EF3307-4F88-4B1D-9FE6-329BD2C58BF2
[81]: https://oracle-base.com/articles/19c/hybrid-partitioned-tables-19c
[82]: https://oracle-base.com/articles/19c/exclude-encryption-clause-on-import-19c
[83]: https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3
[84]: https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp
[85]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[86]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[87]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[88]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[89]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[90]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[91]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[92]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[93]: https://oracle-base.com/articles/misc/transportable-tablespaces
[94]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c#Top
[95]: https://oracle-base.com/misc/site-info#contactus
[96]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c
[97]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE
[98]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c
[99]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE
[100]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2019c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F19c%2Fdata-pump-enhancements-19c
[101]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[102]: https://oracle-base.com/
[103]: https://oracle-base.com/articles/articles
[104]: https://oracle-base.com/dba/scripts
[105]: https://oracle-base.com/blog/
[106]: https://oracle-base.com/misc/ocp-certification
[107]: https://oracle-base.com/articles/misc/videos
[108]: https://oracle-base.com/misc/miscellaneous
[109]: https://oracle-base.com/misc/site-info
[110]: https://oracle-base.com/misc/site-info#biog
[111]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [21c][34] » Here

[][35]

# Data Pump (expdp, impdp) Enhancements in Oracle Database 21c

This article provides an overview of the main Data Pump enhancements in Oracle Database 21c.

- [Setup][36]
- [JSON Data Type Support][37]
- [CHECKSUM, CHECKSUM_ALGORITHM, VERIFY_ONLY and VERIFY_CHECKSUM Parameters][38]
- [INCLUDE and EXCLUDE in the Same Operation][39]
- [Index Compression][40]
- [Transportable Tablespace Enhancements][41]
- [Export from Oracle Autonomous Database][42]
- [Export to and Import From Cloud Object Stores][43]

Related articles.

- [Oracle Cloud : Autonomous Database (ADW or ATP) - Export Data to an Object Store (expdp)][44]
- [Data Pump Export (expdp) to and Import (impdp) From Cloud Object Stores in Oracle Database 21c][45]
- [Data Pump Checksums in Oracle Database 21c][46]
- [Data Pump (expdp, impdp) : All Articles][47]
- Data Pump Quick Links : [10g][48], [11g][49], [12cR1][50], [12cR2][51], [18c][52], [19c][53], [21c][54], [Transportable Tablespaces][55]

[][56]

## Setup

Create a test user in your pluggable database.

conn sys/SysPassword1@//localhost:1521/pdb1 as sysdba

--drop user testuser1 cascade;
create user testuser1 identified by testuser1 quota unlimited on users;
grant connect, resource to testuser1;
grant select_catalog_role to testuser1;

Create a new directory object and grant access to the test user.

create or replace directory tmp_dir as '/tmp/';
grant read, write on directory tmp_dir to testuser1;

Create and populate the following table in your test schema.

conn testuser1/testuser1@//localhost:1521/pdb1

-- drop table t1 purge;

create table t1 (
id number generated always as identity,
json_data json,
constraint ta_pk primary key (id)
);

insert into t1 (json_data) values (json('{"fruit":"apple","quantity":10}'));
insert into t1 (json_data) values (json('{"fruit":"orange","quantity":20}'));
commit;

[][57]

## JSON Data Type Support

The export and import utilities include support for the new JSON data type.

The following example exports the `T1` table using the `expdp` utility. Remember, the `T1` table contains a column defined using the new JSON data type.

$ expdp testuser1/testuser1@//localhost:1521/pdb1 \\
tables=t1 \\
directory=tmp_dir \\
dumpfile=t1.dmp \\
logfile=expdp_t1.log \\
exclude=statistics

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 08:41:15 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_TABLE_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
tables=t1 directory=tmp_dir dumpfile=t1.dmp logfile=expdp_t1.log exclude=statistics
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T1" 6.070 KB 2 rows
Master table "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully loaded/unloaded
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
Dump file set for TESTUSER1.SYS_EXPORT_TABLE_01 is:
/tmp/t1.dmp
Job "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully completed at Sun Sep 5 08:41:45 2021 elapsed 0 00:00:28

$

We import the dump file, remapping the table name to `T1_COPY`.

$ impdp testuser1/testuser1@//localhost:1521/pdb1 \\
tables=t1 \\
directory=tmp_dir \\
dumpfile=t1.dmp \\
logfile=impdp_t1.log \\
remap_table=testuser1.t1:t1_copy

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 08:46:32 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Master table "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully loaded/unloaded
Starting "TESTUSER1"."SYS_IMPORT_TABLE_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
tables=t1 directory=tmp_dir dumpfile=t1.dmp logfile=impdp_t1.log remap_table=testuser1.t1:t1_copy
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
. . imported "TESTUSER1"."T1_COPY" 6.070 KB 2 rows
Processing object type TABLE_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
ORA-31684: Object type CONSTRAINT:"TESTUSER1"."TA_PK" already exists

Job "TESTUSER1"."SYS_IMPORT_TABLE_01" completed with 1 error(s) at Sun Sep 5 08:46:39 2021 elapsed 0 00:00:05

$

[][58]

## CHECKSUM, CHECKSUM_ALGORITHM, VERIFY_ONLY and VERIFY_CHECKSUM Parameters

Calculating checksums takes time. The bigger the dump file, the more effort it takes to compute a checksum.

The `CHECKSUM` and `CHECKSUM_ALGORITHM` parameters have been added to prevent tampering of data in dump files when they are at rest on disk. If we set the `CHECKSUM_ALGORITHM` parameter, then the `CHECKSUM` parameter defaults to yes. If neither are set, the `CHECKSUM` parameter defaults to no. The `CHECKSUM_ALGORITHM` parameter can be set to CRC32, SHA256, SHA384 or SHA512, with SHA256 being the default.

In the following example we enable the `CHECKSUM`, and explicitly set the `CHECKSUM_ALGORITHM` to the default value for a schema export.

$ expdp testuser1/testuser1@//localhost:1521/pdb1 \\
schemas=testuser1 \\
directory=tmp_dir \\
dumpfile=testuser1.dmp \\
logfile=expdp_testuser1.log \\
exclude=statistics \\
**checksum=yes** \\
**checksum_algorithm=SHA256**

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 08:58:55 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_SCHEMA_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
schemas=testuser1 directory=tmp_dir dumpfile=testuser1.dmp logfile=expdp_testuser1.log exclude=statistics checksum=yes checksum_algorithm=SHA256
Processing object type SCHEMA_EXPORT/TABLE/TABLE_DATA
Processing object type SCHEMA_EXPORT/PRE_SCHEMA/PROCACT_SCHEMA
Processing object type SCHEMA_EXPORT/TABLE/TABLE
Processing object type SCHEMA_EXPORT/TABLE/COMMENT
Processing object type SCHEMA_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type SCHEMA_EXPORT/TABLE/INDEX/INDEX
Processing object type SCHEMA_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T1" 6.070 KB 2 rows
. . exported "TESTUSER1"."T1_COPY" 6.078 KB 2 rows
Master table "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully loaded/unloaded
**Generating checksums for dump file set**
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
Dump file set for TESTUSER1.SYS_EXPORT_SCHEMA_01 is:
/tmp/testuser1.dmp
Job "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully completed at Sun Sep 5 08:59:38 2021 elapsed 0 00:00:41

$

We can validate the checksum of a dumpfile using the `VERIFY_ONLY` parameter.

$ impdp testuser1/testuser1@//localhost:1521/pdb1 \\
directory=tmp_dir \\
dumpfile=testuser1.dmp \\
**verify_only=yes**

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 09:10:55 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Verifying dump file checksums
Master table "TESTUSER1"."SYS_IMPORT_FULL_01" successfully loaded/unloaded
dump file set is complete
**verified checksum for dump file "/tmp/testuser1.dmp"
dump file set is consistent**
Job "TESTUSER1"."SYS_IMPORT_FULL_01" successfully completed at Sun Sep 5 09:10:57 2021 elapsed 0 00:00:01

$

We use the `VERIFY_CHECKSUM` parameter to verify the checksum during the import. If the verification fails, the import doesn't take place. If we don't use the `VERIFY_CHECKSUM` parameter, the import will continue, even if the checksum is incorrect.

$ impdp testuser1/testuser1@//localhost:1521/pdb1 \\
tables=t1 \\
directory=tmp_dir \\
dumpfile=testuser1.dmp \\
logfile=impdp_t1_copy_again.log \\
remap_table=testuser1.t1:t1_copy_again \\
**verify_checksum=yes**

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 09:16:24 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
**Verifying dump file checksums**
Master table "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully loaded/unloaded
Starting "TESTUSER1"."SYS_IMPORT_TABLE_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
tables=t1 directory=tmp_dir dumpfile=testuser1.dmp logfile=impdp_t1_copy_again.log
remap_table=testuser1.t1:t1_copy_again verify_checksum=yes
Processing object type SCHEMA_EXPORT/TABLE/TABLE
Processing object type SCHEMA_EXPORT/TABLE/TABLE_DATA
. . imported "TESTUSER1"."T1_COPY_AGAIN" 6.070 KB 2 rows
Processing object type SCHEMA_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type SCHEMA_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
ORA-31684: Object type CONSTRAINT:"TESTUSER1"."TA_PK" already exists

Job "TESTUSER1"."SYS_IMPORT_TABLE_01" completed with 1 error(s) at Sun Sep 5 09:16:30 2021 elapsed 0 00:00:04

$

[][59]

## INCLUDE and EXCLUDE in the Same Operation

In Oracle database 21c, `INCLUDE` and `EXCLUDE` parameters can be part of the same command. In previous releases `INCLUDE` and `EXCLUDE` parameters were mutually exclusive.

The following example combines `INCLUDE` and `EXCLUDE` parameters in a single command. We have to escape some of the quotes for the command line.

$ expdp testuser1/testuser1@//localhost:1521/pdb1 \\
schemas=testuser1 \\
directory=tmp_dir \\
dumpfile=testuser1.dmp \\
logfile=expdp_testuser1.log \\
**include="table:\\"in ('T1')\\""** \\
**exclude="table:\\"in ('T1_COPY','T1_COPY_AGAIN')\\""** \\
**exclude=statistics**

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 10:54:03 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_SCHEMA_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
schemas=testuser1 directory=tmp_dir dumpfile=testuser1.dmp logfile=expdp_testuser1.log
include=table:"in ('T1')" exclude=table:"in ('T1_COPY','T1_COPY_AGAIN')" exclude=statistics
Processing object type SCHEMA_EXPORT/TABLE/TABLE_DATA
Processing object type SCHEMA_EXPORT/TABLE/TABLE
Processing object type SCHEMA_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type SCHEMA_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T1" 6.070 KB 2 rows
Master table "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully loaded/unloaded
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
Dump file set for TESTUSER1.SYS_EXPORT_SCHEMA_01 is:
/tmp/testuser1.dmp
Job "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully completed at Sun Sep 5 10:54:31 2021 elapsed 0 00:00:27

$

[][60]

## Index Compression

In Oracle database 21c we can optionally compress indexes on import using the `TRANSFORM` parameter and the `INDEX_COMPRESSION_CLAUSE`.

Create a test table with some indexes.

conn testuser1/testuser1@//localhost:1521/pdb1

-- drop table t2 purge;

create table t2 as
select level as id,
'Description for ' || level as col1,
case mod(level, 2)
when 0 then 'one'
else 'two'
end as col2,
trunc(dbms_random.value(0,10)) as col3,
trunc(dbms_random.value(0,20)) as col4
from dual
connect by level &lt;= 10000;

alter table t2 add constraint t2_pk primary key (id);
create index t2_col1_idx on t2(col1);
create index t2_col2_idx on t2(col2);
create index t2_col3_idx on t2(col3);
create index t2_col4_idx on t2(col4);

Check the compression for the table and indexes.

select compression
from user_tables
where table_name = 'T2';

## COMPRESS

DISABLED

SQL&gt;

column index_name format a12

select index_name,
compression
from user_indexes
where table_name = 'T2'
order by 1;

INDEX_NAME COMPRESSION

---

T2_COL1_IDX DISABLED
T2_COL2_IDX DISABLED
T2_COL3_IDX DISABLED
T2_COL4_IDX DISABLED
T2_PK DISABLED

SQL&gt;

Export the table.

$ expdp testuser1/testuser1@//localhost:1521/pdb1 \\
tables=t2 \\
directory=tmp_dir \\
dumpfile=t2.dmp \\
logfile=expdp_t2.log \\
exclude=statistics

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 11:57:18 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_TABLE_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
tables=t2 directory=tmp_dir dumpfile=t2.dmp logfile=expdp_t2.log exclude=statistics
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/INDEX/INDEX
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T2" 384.8 KB 10000 rows
Master table "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully loaded/unloaded
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
Dump file set for TESTUSER1.SYS_EXPORT_TABLE_01 is:
/tmp/t2.dmp
Job "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully completed at Sun Sep 5 11:57:35 2021 elapsed 0 00:00:14

$

Remove the table, so we can reimport it.

conn testuser1/testuser1@//localhost:1521/pdb1

drop table t2 purge;

Import the table from the dump file, using the `TRANSFORM` parameter to compress the table using the `TABLE_COMPRESSION_CLAUSE` and the indexes using the `INDEX_COMPRESSION_CLAUSE`.

$ impdp testuser1/testuser1@//localhost:1521/pdb1 \\
tables=t2 \\
directory=tmp_dir \\
dumpfile=t2.dmp \\
logfile=impdp_t2.log \\
**transform=table_compression_clause:\\"compress basic\\"** \\
**transform=index_compression_clause:\\"compress advanced low\\"**

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 12:02:22 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates. All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Master table "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully loaded/unloaded
Starting "TESTUSER1"."SYS_IMPORT_TABLE_01": testuser1/\*\*\*\*\*\*\*\*@//localhost:1521/pdb1
tables=t2 directory=tmp_dir dumpfile=t2.dmp logfile=impdp_t2.log
transform=table_compression_clause:"compress basic" transform=index_compression_clause:"compress advanced low"
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
. . imported "TESTUSER1"."T2" 384.8 KB 10000 rows
Processing object type TABLE_EXPORT/TABLE/INDEX/INDEX
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
Job "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully completed at Sun Sep 5 12:02:29 2021 elapsed 0 00:00:05

$

Check the compression for the table and indexes.

conn testuser1/testuser1@//localhost:1521/pdb1

select compression
from user_tables
where table_name = 'T2';

## COMPRESS

ENABLED

SQL&gt;

column index_name format a12

select index_name,
compression
from user_indexes
where table_name = 'T2'
order by 1;

INDEX_NAME COMPRESSION

---

T2_COL1_IDX ADVANCED LOW
T2_COL2_IDX ADVANCED LOW
T2_COL3_IDX ADVANCED LOW
T2_COL4_IDX ADVANCED LOW
T2_PK DISABLED

SQL&gt;

We can see both the table and indexes have now been compressed.

You can read the full description for the `TRANSFORM` parameter [here][61]. For information about index compression see the `CREATE INDEX` statement [here][62].

[][63]

## Transportable Tablespace Enhancements

In Oracle 21c transportable tablespace exports (`expdp`) and imports (`impdp`) can now use the `PARALLEL` parameter to parallelize the operations.

In Oracle 21c Data Pump can resume failed transportable tablespace jobs at, or near, the point of failure. In previous releases transportable tablespace jobs could not be resumed.

[][64]

## Export from Oracle Autonomous Database

We can use a local Oracle 21.3 installation to export data from the autonomous database to an object store using the `expdp` utility. You can read about this functionality in this article.

- [Oracle Cloud : Autonomous Database (ADW or ATP) - Export Data to an Object Store (expdp)][65]

[][66]

## Export to and Import From Cloud Object Stores

Data Pump supports cloud object stores as a dumpfile location for on-prem installations from Oracle 21c onward.

- [Data Pump Export (expdp) to and Import (impdp) From Cloud Object Stores in Oracle Database 21c][67]

For more information see:

- [Oracle Database Utilities 21c][68]
- [Oracle Cloud : Autonomous Database (ADW or ATP) - Export Data to an Object Store (expdp)][69]
- [Data Pump Export (expdp) to and Import (impdp) From Cloud Object Stores in Oracle Database 21c][70]
- [Data Pump Checksums in Oracle Database 21c][71]
- [Data Pump (expdp, impdp) : All Articles][72]
- Data Pump Quick Links : [10g][73], [11g][74], [12cR1][75], [12cR2][76], [18c][77], [19c][78], [21c][79], [Transportable Tablespaces][80]

Hope this helps. Regards Tim...

[Back to the Top.][81]

Created: 2021-09-07&nbsp;&nbsp;Updated: 2022-06-25

[Contact Us][82]

[][83][][84][][85][][86][][87][][88]

[Home][89] | [Articles][90] | [Scripts][91] | [Blog][92] | [Certification][93] | [Videos][94] | [Misc][95] | [About][96]

[About Tim Hall][97] [Copyright &amp; Disclaimer][98]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#
[7]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/21c
[35]: https://oracle-base.com/articles/21c/null
[36]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#setup
[37]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#json-data-type-support
[38]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#checksum
[39]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#include-and-exclude-in-the-same-operation
[40]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#index-compression
[41]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#transportable-tablespace-enhancements
[42]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#export-from-autonomous-database
[43]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#export-import-object-store
[44]: https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp
[45]: https://oracle-base.com/articles/21c/data-pump-export-import-cloud-object-store-21c
[46]: https://www.youtube.com/watch?v=sxyIcxzhDck
[47]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[48]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[49]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[50]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[51]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[52]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[53]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[54]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[55]: https://oracle-base.com/articles/misc/transportable-tablespaces
[56]: https://oracle-base.com/articles/21c/null
[57]: https://oracle-base.com/articles/21c/null
[58]: https://oracle-base.com/articles/21c/null
[59]: https://oracle-base.com/articles/21c/null
[60]: https://oracle-base.com/articles/21c/null
[61]: https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-datapump-import-utility.html#GUID-64FB67BD-EB67-4F50-A4D2-5D34518E6BDB
[62]: https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-INDEX.html
[63]: https://oracle-base.com/articles/21c/null
[64]: https://oracle-base.com/articles/21c/null
[65]: https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp
[66]: https://oracle-base.com/articles/21c/null
[67]: https://oracle-base.com/articles/21c/data-pump-export-import-cloud-object-store-21c
[68]: https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-datapump-import-utility.html
[69]: https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp
[70]: https://oracle-base.com/articles/21c/data-pump-export-import-cloud-object-store-21c
[71]: https://www.youtube.com/watch?v=sxyIcxzhDck
[72]: https://oracle-base.com/articles/misc/articles-misc#data-pump
[73]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[74]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[75]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1
[76]: https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2
[77]: https://oracle-base.com/articles/18c/data-pump-enhancements-18c
[78]: https://oracle-base.com/articles/19c/data-pump-enhancements-19c
[79]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c
[80]: https://oracle-base.com/articles/misc/transportable-tablespaces
[81]: https://oracle-base.com/articles/21c/data-pump-enhancements-21c#Top
[82]: https://oracle-base.com/misc/site-info#contactus
[83]: https://x.com/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c
[84]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE
[85]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c
[86]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c&title=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE
[87]: https://threads.net/intent/post?text=Data%20Pump%20(expdp%2C%20impdp)%20Enhancements%20in%20Oracle%20Database%2021c%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2F21c%2Fdata-pump-enhancements-21c
[88]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[89]: https://oracle-base.com/
[90]: https://oracle-base.com/articles/articles
[91]: https://oracle-base.com/dba/scripts
[92]: https://oracle-base.com/blog/
[93]: https://oracle-base.com/misc/ocp-certification
[94]: https://oracle-base.com/articles/misc/videos
[95]: https://oracle-base.com/misc/miscellaneous
[96]: https://oracle-base.com/misc/site-info
[97]: https://oracle-base.com/misc/site-info#biog
[98]: https://oracle-base.com/misc/site-info#copyright

[][9][][10][][11][][12][][13][][14]

[8i][15] | [9i][16] | [10g][17] | [11g][18] | [12c][19] | [13c][20] | [18c][21] | [19c][22] | [21c][23] | [23ai][24] | [24ai][25] | [Misc][26] | [PL/SQL][27] | [SQL][28] | [RAC][29] | [WebLogic][30] | [Linux][31]

[Home][32] » [Articles][33] » [Misc][34] » Here

[][35]

# Transportable Tablespaces

Transportable tablespaces were introduced in Oracle 8i to allow whole tablespaces to be copied between databases in the time it takes to copy the datafiles. In Oracle 8i one of the restrictions was that the block size of both databases must be the same. In Oracle 9i the introduction of multiple block sizes has removed this restriction. In this article I will run through a simple example of transporting a tablespace between two databases.

- [Setup][36]
- [Source Database][37]
- [Destination Database][38]
- [Cross-Platform Tablespace Conversions][39]

Related articles.

- [Oracle Data Pump in Oracle Database 10g (expdp and impdp)][40]
- [Data Pump Enhancements in Oracle Database 11g Release 1][41]
- [SQL Developer 3.1 Data Pump Wizards (expdp, impdp)][42]
- [Cross-Platform Tablespace Conversion][43]

[][44]

## Setup

For this example I'm going to create a new tablespace, user and table to work with in the source database.

CONN / AS SYSDBA

CREATE TABLESPACE test_data
DATAFILE '/u01/app/oracle/oradata/DB11G/test_data01.dbf'
SIZE 1M AUTOEXTEND ON NEXT 1M;

CREATE USER test_user IDENTIFIED BY test_user
DEFAULT TABLESPACE test_data
TEMPORARY TABLESPACE temp
QUOTA UNLIMITED ON test_data;

GRANT CREATE SESSION, CREATE TABLE TO test_user;

CONN test_user/test_user

CREATE TABLE test_tab (
id NUMBER,
description VARCHAR2(50),
CONSTRAINT test_tab_pk PRIMARY KEY (id)
);

INSERT /\*+ APPEND \*/ INTO test_tab (id, description)
SELECT level,
'Description for ' || level
FROM dual
CONNECT BY level &lt;= 10000;

COMMIT;

[][45]

## Source Database

For a tablespace to be transportable it must be totally self contained. This can be checked using the `DBMS_TTS.TRANSPORT_SET_CHECK` procedure. The `TS_LIST` parameter accepts a comma separated list of tablespace names and the `INCL_CONSTRAINTS` parameter indicates if constraints should be included in the check.

CONN / AS SYSDBA
EXEC SYS.DBMS_TTS.TRANSPORT_SET_CHECK(ts_list =&gt; 'TEST_DATA', incl_constraints =&gt; TRUE);

PL/SQL procedure successfully completed.

SQL&gt;

The `TRANSPORT_SET_VIOLATIONS` view is used to check for any violations.

SELECT \* FROM transport_set_violations;

no rows selected

SQL&gt;

Assuming no violations are produced we are ready to proceed by switching the tablespace to read only mode.

SQL&gt; ALTER TABLESPACE test_data READ ONLY;

Tablespace altered.

SQL&gt;

Next we export the tablespace metadata using the export (expdp or exp) utility. If you are using 10g or above you should use the expdp utility. This requires a directory object pointing to a physical directory with the necessary permissions on the database server.

CONN / AS SYSDBA
CREATE OR REPLACE DIRECTORY temp_dir AS '/tmp/';
GRANT READ, WRITE ON DIRECTORY temp_dir TO system;

We can now export the tablespace metadata.

$ expdp userid=system/password directory=temp_dir transport_tablespaces=test_data dumpfile=test_data.dmp logfile=test_data_exp.log

If you are using a version prior to 10g, you do not need the directory object and your command would look something like this.

$ exp userid='system/password as sysdba' transport_tablespace=y tablespaces=test_data file=test_data.dmp log=test_data_exp.log

Copy the datafile to the appropriate location on the destination database server. Also copy the dump file to a suitable place on the destination database server. You may use binary FTP or SCP to perform this copy.

The source tablespace can now be switched back to read/write mode.

ALTER TABLESPACE test_data READ WRITE;

Tablespace altered.

SQL&gt;

[][46]

## Destination Database

Create any users in the destination database that owned objects within the tablespace being transported, assuming they do not already exist.

CONN / AS SYSDBA

CREATE USER test_user IDENTIFIED BY test_user;
GRANT CREATE SESSION, CREATE TABLE TO test_user;

Now we import the metadata into the destination database. If you are using 10g or above you should use the impdp utility. This requires a directory object pointing to a physical directory with the necessary permissions on the database server.

CONN / AS SYSDBA
CREATE OR REPLACE DIRECTORY temp_dir AS '/tmp/';
GRANT READ, WRITE ON DIRECTORY temp_dir TO system;

We can now import the tablespace metadata.

$ impdp userid=system/password directory=temp_dir dumpfile=test_data.dmp logfile=test_data_imp.log transport_datafiles='/u01/app/oracle/oradata/DB11GB/test_data01.dbf'

If you are using a version prior to 10g, you do not need the directory object and your command would look something like this.

$ imp userid='system/password as sysdba' transport_tablespace=y datafiles='/u01/app/oracle/oradata/DB11GB/test_data01.dbf' tablespaces=test_data file=test_data.dmp log=test_data_imp.log

Switch the new tablespace into read write mode.

SQL&gt; ALTER TABLESPACE test_data READ WRITE;

Tablespace altered.

SQL&gt;

The tablespace is now available in the destination database.

SELECT tablespace_name, plugged_in, status
FROM dba_tablespaces
WHERE tablespace_name = 'TEST_DATA';

TABLESPACE_NAME PLU STATUS

---

TEST_DATA YES ONLINE

1 row selected.

SQL&gt;

[][47]

## Cross-Platform Tablespace Conversions

If you are transporting tablespaces between platforms you need to perform [Cross-Platform Tablespace Conversions][48].

For more information see:

- [Transporting Tablespaces Between Databases][49]
- [Oracle Data Pump in Oracle Database 10g (expdp and impdp)][50]
- [Data Pump Enhancements in Oracle Database 11g Release 1][51]
- [SQL Developer 3.1 Data Pump Wizards (expdp, impdp)][52]
- [Cross-Platform Tablespace Conversion][53]

Hope this helps. Regards Tim...

[Back to the Top.][54]

Created: 2005-05-14&nbsp;&nbsp;Updated: 2015-06-27

[Contact Us][55]

[][56][][57][][58][][59][][60][][61]

[Home][62] | [Articles][63] | [Scripts][64] | [Blog][65] | [Certification][66] | [Videos][67] | [Misc][68] | [About][69]

[About Tim Hall][70] [Copyright &amp; Disclaimer][71]

[1]: https://oracle-base.com/
[2]: https://oracle-base.com/articles/misc/transportable-tablespaces#
[3]: https://oracle-base.com/dba/scripts
[4]: https://oracle-base.com/blog/
[5]: https://oracle-base.com/articles/misc/videos
[6]: https://oracle-base.com/articles/misc/transportable-tablespaces#
[7]: https://oracle-base.com/articles/misc/transportable-tablespaces?display_type=printable
[8]: https://oracle-base.com/misc/site-info
[9]: https://x.com/intent/post?text=Transportable%20Tablespaces%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces
[10]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces&title=Transportable%20Tablespaces%20-%20ORACLE-BASE
[11]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces
[12]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces&title=Transportable%20Tablespaces%20-%20ORACLE-BASE
[13]: https://threads.net/intent/post?text=Transportable%20Tablespaces%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces
[14]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[15]: https://oracle-base.com/articles/8i/articles-8i
[16]: https://oracle-base.com/articles/9i/articles-9i
[17]: https://oracle-base.com/articles/10g/articles-10g
[18]: https://oracle-base.com/articles/11g/articles-11g
[19]: https://oracle-base.com/articles/12c/articles-12c
[20]: https://oracle-base.com/articles/13c/articles-13c
[21]: https://oracle-base.com/articles/18c/articles-18c
[22]: https://oracle-base.com/articles/19c/articles-19c
[23]: https://oracle-base.com/articles/21c/articles-21c
[24]: https://oracle-base.com/articles/23/articles-23
[25]: https://oracle-base.com/articles/24/articles-24
[26]: https://oracle-base.com/articles/misc/articles-misc
[27]: https://oracle-base.com/articles/plsql/articles-plsql
[28]: https://oracle-base.com/articles/sql/articles-sql
[29]: https://oracle-base.com/articles/rac/articles-rac
[30]: https://oracle-base.com/articles/web/articles-web
[31]: https://oracle-base.com/articles/linux/articles-linux
[32]: https://oracle-base.com/
[33]: https://oracle-base.com/articles
[34]: https://oracle-base.com/articles/misc
[35]: https://oracle-base.com/articles/misc/null
[36]: https://oracle-base.com/articles/misc/transportable-tablespaces#setup
[37]: https://oracle-base.com/articles/misc/transportable-tablespaces#source
[38]: https://oracle-base.com/articles/misc/transportable-tablespaces#destination
[39]: https://oracle-base.com/articles/misc/transportable-tablespaces#cross-platform-tablespace-conversions
[40]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[41]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[42]: https://oracle-base.com/articles/misc/sql-developer-31-data-pump-wizards
[43]: https://oracle-base.com/articles/10g/rman-enhancements-10g#cross_platform_tablespace_conversion
[44]: https://oracle-base.com/articles/misc/null
[45]: https://oracle-base.com/articles/misc/null
[46]: https://oracle-base.com/articles/misc/null
[47]: https://oracle-base.com/articles/misc/null
[48]: https://oracle-base.com/articles/10g/rman-enhancements-10g#cross_platform_tablespace_conversion
[49]: http://docs.oracle.com/cd/E11882_01/server.112/e25494/tspaces.htm#ADMIN11394
[50]: https://oracle-base.com/articles/10g/oracle-data-pump-10g
[51]: https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1
[52]: https://oracle-base.com/articles/misc/sql-developer-31-data-pump-wizards
[53]: https://oracle-base.com/articles/10g/rman-enhancements-10g#cross_platform_tablespace_conversion
[54]: https://oracle-base.com/articles/misc/transportable-tablespaces#Top
[55]: https://oracle-base.com/misc/site-info#contactus
[56]: https://x.com/intent/post?text=Transportable%20Tablespaces%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces
[57]: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces&title=Transportable%20Tablespaces%20-%20ORACLE-BASE
[58]: https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces
[59]: https://www.reddit.com/submit?url=https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces&title=Transportable%20Tablespaces%20-%20ORACLE-BASE
[60]: https://threads.net/intent/post?text=Transportable%20Tablespaces%20-%20ORACLE-BASE%20https%3A%2F%2Foracle-base.com%2Farticles%2Fmisc%2Ftransportable-tablespaces
[61]: https://www.youtube.com/c/oraclebasepage?sub_confirmation=1
[62]: https://oracle-base.com/
[63]: https://oracle-base.com/articles/articles
[64]: https://oracle-base.com/dba/scripts
[65]: https://oracle-base.com/blog/
[66]: https://oracle-base.com/misc/ocp-certification
[67]: https://oracle-base.com/articles/misc/videos
[68]: https://oracle-base.com/misc/miscellaneous
[69]: https://oracle-base.com/misc/site-info
[70]: https://oracle-base.com/misc/site-info#biog
[71]: https://oracle-base.com/misc/site-info#copyright
